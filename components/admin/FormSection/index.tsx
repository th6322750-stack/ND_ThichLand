import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  badge?: string;
  internalOnly?: boolean;
  children: ReactNode;
}

export function FormSection({ title, badge, internalOnly = false, children }: FormSectionProps) {
  return (
    <section
      className={`rounded-md border p-6 ${
        internalOnly ? "border-gold bg-[#FBF3E4]" : "border-line bg-surface"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 className={`text-h3 ${internalOnly ? "text-gold" : "text-ink"}`}>{title}</h2>
        {badge && (
          <span className="rounded-full bg-success/10 px-3 py-1 text-label text-success">{badge}</span>
        )}
      </div>
      {internalOnly && (
        <p className="mt-1 text-body text-[#8A6A2F]">Không public lên website</p>
      )}
      <div className="mt-6 grid grid-cols-1 gap-6 desktop:grid-cols-2">{children}</div>
    </section>
  );
}
