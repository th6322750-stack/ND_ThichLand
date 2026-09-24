import type { Availability, ProjectStatus } from "@/lib/types";

/**
 * Row state used to be plain body text — "Còn trống" / "Sắp trống" / "Đã cho
 * thuê" all rendered identically, so a table of twelve rows gave an operator
 * nothing to scan for. These are the states the CMS actually stores, each
 * mapped to one tone, and the tone comes from the semantic tokens
 * (success/gold/error/muted) rather than the brand accent.
 */
type Tone = "positive" | "attention" | "critical" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  positive: "border-success/30 bg-success/10 text-success",
  attention: "border-gold/40 bg-gold/10 text-gold",
  critical: "border-error/30 bg-error/10 text-error",
  neutral: "border-line bg-soft text-muted",
};

export function StatusChip({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-label ${TONE_CLASS[tone]}`}
    >
      {label}
    </span>
  );
}

const AVAILABILITY_TONE: Record<Availability, Tone> = {
  "Còn trống": "positive",
  "Sắp trống": "attention",
  // Not a failure — just not currently on the market. Neutral, so it recedes
  // instead of competing with rows that need action.
  "Đã cho thuê": "neutral",
};

const PROJECT_STATUS_TONE: Record<ProjectStatus, Tone> = {
  "Đang triển khai": "attention",
  "Tiêu biểu": "positive",
  "Đã hoàn thành": "neutral",
};

/**
 * One place that decides how a rental row's state reads, so the list, the
 * dashboard sample and anything added later cannot drift apart.
 * `incomplete` outranks `draft`: a record held back because required fields
 * are missing is a problem to fix, while a draft is a deliberate choice.
 */
export function RentalStateChip({
  published,
  availability,
  incomplete,
}: {
  published: boolean;
  availability: Availability | null;
  incomplete: boolean;
}) {
  if (incomplete) return <StatusChip label="Thiếu dữ liệu" tone="critical" />;
  if (!published) return <StatusChip label="Nháp" tone="neutral" />;
  if (!availability) return <StatusChip label="Chưa rõ" tone="neutral" />;
  return <StatusChip label={availability} tone={AVAILABILITY_TONE[availability]} />;
}

export function ProjectStateChip({
  published,
  status,
}: {
  published: boolean;
  status: ProjectStatus | null;
}) {
  if (!published) return <StatusChip label="Nháp" tone="neutral" />;
  if (!status) return <StatusChip label="Đã đăng" tone="positive" />;
  return <StatusChip label={status} tone={PROJECT_STATUS_TONE[status]} />;
}

export function PublishChip({ published }: { published: boolean }) {
  return published ? (
    <StatusChip label="Đã đăng" tone="positive" />
  ) : (
    <StatusChip label="Nháp" tone="neutral" />
  );
}
