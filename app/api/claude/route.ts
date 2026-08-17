import { NextResponse } from "next/server";
import { callClaude } from "@/lib/server/claude";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : null;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "messages is required and must be a non-empty array." },
        { status: 400 },
      );
    }

    const result = await callClaude({
      model: typeof body?.model === "string" ? body.model : undefined,
      system: typeof body?.system === "string" ? body.system : undefined,
      messages: messages.map((message: any) => ({
        role: message?.role === "assistant" || message?.role === "user" || message?.role === "system"
          ? message.role
          : "user",
        content: typeof message?.content === "string" ? message.content : String(message?.content ?? ""),
      })),
      max_tokens: typeof body?.max_tokens === "number" ? body.max_tokens : 1024,
      temperature: typeof body?.temperature === "number" ? body.temperature : 0.2,
    });

    const text = result.content
      .map((block) => block.text ?? "")
      .join("\n")
      .trim();

    return NextResponse.json({
      text,
      raw: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Claude API error";

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Claude API route is ready.",
    env: {
      hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
    },
  });
}
