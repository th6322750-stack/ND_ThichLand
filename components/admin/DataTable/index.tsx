import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
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
            <div className="h-4 w-2/3 rounded bg-soft" />
          </div>
        ))}
      </div>
    );
  }

  if (state === "empty" || rows.length === 0) {
    return (
      <div className="rounded-md border border-line bg-surface p-10 text-center text-body text-muted">
        {emptyLabel ?? "Chưa có dữ liệu nào."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-line bg-surface">
      <table className="w-full min-w-[720px] text-left text-body">
        <thead>
          <tr className="border-b border-line text-muted">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 font-normal">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-line last:border-0 hover:bg-soft">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4">
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
