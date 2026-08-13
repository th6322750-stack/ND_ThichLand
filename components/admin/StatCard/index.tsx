interface StatCardProps {
  color: string;
  label: string;
  value: string;
  delta: string;
  deltaColor: string;
}

export function StatCard({ color, label, value, delta, deltaColor }: StatCardProps) {
  return (
    <div className="rounded-md border border-line bg-surface p-6">
      <span className="inline-block h-8 w-8 rounded-full" style={{ backgroundColor: color }} />
      <p className="mt-4 text-body text-muted">{label}</p>
      <div className="mt-1 flex items-baseline justify-between">
        <span className="text-h2 text-ink">{value}</span>
        <span className="text-body" style={{ color: deltaColor }}>
          {delta}
        </span>
      </div>
    </div>
  );
}
