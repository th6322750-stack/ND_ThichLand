import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  /** Figures read as a column when they share an edge and a tabular figure width. */
  numeric?: boolean;
  /** Right-align without the tabular figures — for a trailing actions column. */
  align?: "left" | "right";
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  state?: "default" | "empty" | "loading";
  emptyLabel?: string;
}

export function DataTable<T>({ columns, rows, rowKey, state = "default", emptyLabel }: DataTableProps<T>) {
  if (state === "loading") {
    return (
      <div className="overflow-hidden rounded-md border border-line bg-surface">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse border-b border-line p-6 last:border-0">
            <div className="h-4 w-2/3 rounded-sm bg-soft" />
          </div>
        ))}
      </div>
    );
  }

  if (state === "empty" || rows.length === 0) {
    return (
      <div className="rounded-md border border-line bg-surface p-16 text-center">
        <p className="text-body text-muted">{emptyLabel ?? "Chưa có dữ liệu nào."}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-line bg-surface">
      <table className="w-full min-w-[720px] text-left text-body">
        {/* The header used to be body-weight text in muted grey, which sat at
            the same visual level as the data under it. Small caps on the soft
            ground separates the two without adding a rule per column. */}
        <thead>
          <tr className="border-b border-line bg-soft">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`whitespace-nowrap px-6 py-3 text-label uppercase tracking-[0.08em] text-muted ${
                  col.numeric || col.align === "right" ? "text-right" : ""
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-line transition-colors duration-fast ease-base last:border-0 hover:bg-soft"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  // Cells hold their line and the wrapper scrolls. Without
                  // this, a narrow viewport wrapped "P.301 - Tòa A" onto three
                  // lines and broke the column headers apart mid-phrase.
                  className={`whitespace-nowrap px-6 py-4 ${col.numeric ? "text-right tabular-nums" : ""} ${
                    col.align === "right" ? "text-right" : ""
                  }`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
