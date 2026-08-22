import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth/dal";
import { callClaude, type ClaudeMessage } from "@/lib/server/claude";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 32_000;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 4_000;
const MAX_TOTAL_MESSAGE_CHARS = 16_000;
const MAX_SYSTEM_CHARS = 4_000;
const MAX_OUTPUT_TOKENS = 2_048;

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function parseMessages(value: unknown): ClaudeMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return null;

  let totalChars = 0;
  const messages: ClaudeMessage[] = [];

  for (const valueMessage of value) {
    if (!valueMessage || typeof valueMessage !== "object") return null;

    const message = valueMessage as { role?: unknown; content?: unknown };
    if (message.role !== "user" && message.role !== "assistant") return null;
    if (typeof message.content !== "string") return null;

    const content = message.content.trim();
    if (!content || content.length > MAX_MESSAGE_CHARS) return null;

    totalChars += content.length;
    if (totalChars > MAX_TOTAL_MESSAGE_CHARS) return null;
    messages.push({ role: message.role, content });
  }

  return messages;
}

export async function POST(request: Request) {
  // This endpoint spends a private API key, so a valid server-verified admin
  // session is mandatory. proxy.ts does not cover /api and must not be used as
  // an authorization boundary.
  if (!(await getSession())) {
    return errorResponse("Unauthorized", 401);
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return errorResponse("Content-Type must be application/json.", 415);
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return errorResponse("Request body is too large.", 413);
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return errorResponse("Request body is too large.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  if (!body || typeof body !== "object") {
    return errorResponse("Request body must be a JSON object.", 400);
  }

  const payload = body as { messages?: unknown; system?: unknown; max_tokens?: unknown };
  const messages = parseMessages(payload.messages);
  if (!messages) {
    return errorResponse("messages must contain 1-20 valid user/assistant messages.", 400);
  }

  const system = typeof payload.system === "string" ? payload.system.trim() : undefined;
  if (system && system.length > MAX_SYSTEM_CHARS) {
    return errorResponse("system is too long.", 400);
  }

  const requestedMaxTokens =
    typeof payload.max_tokens === "number" && Number.isFinite(payload.max_tokens)
      ? Math.trunc(payload.max_tokens)
      : 1_024;
  const maxTokens = Math.min(Math.max(requestedMaxTokens, 1), MAX_OUTPUT_TOKENS);

  try {
    const result = await callClaude({
      system: system || undefined,
      messages,
      max_tokens: maxTokens,
      temperature: 0.2,
    });

    const text = result.content
      .map((block) => block.text ?? "")
      .join("\n")
      .trim();

    return NextResponse.json({ text });
  } catch {
    // Do not reflect provider errors or configuration details to the client.
    return errorResponse("AI service is temporarily unavailable.", 502);
  }
}

export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}
