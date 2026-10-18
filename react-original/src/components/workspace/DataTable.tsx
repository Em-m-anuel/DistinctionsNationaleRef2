import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/utils/cn";

export interface DataColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: string;
}

export function DataTable<T>({ columns, rows, rowKey, empty = "Aucun élément à afficher." }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse text-left">
          <thead className="bg-canvas">
            <tr>
              {columns.map((column) => <th key={column.key} className={cn("border-b border-line px-5 py-3 text-[0.625rem] font-bold tracking-[0.12em] text-muted uppercase", column.className)}>{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length ? rows.map((row) => (
              <tr key={rowKey(row)} className="group transition-colors hover:bg-canvas/70">
                {columns.map((column) => <td key={column.key} className={cn("px-5 py-4 align-middle text-[0.8125rem] text-ink-700", column.className)}>{column.render(row)}</td>)}
              </tr>
            )) : (
              <tr><td colSpan={columns.length} className="px-5 py-14 text-center text-sm text-muted"><Icon name="folder" className="mx-auto mb-2 size-6 text-ink-300" />{empty}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3 text-[0.6875rem] text-muted">
        <span>{rows.length} élément{rows.length > 1 ? "s" : ""} affiché{rows.length > 1 ? "s" : ""}</span>
        <div className="flex items-center gap-1"><button type="button" disabled className="flex size-7 items-center justify-center rounded-lg border border-line text-ink-300"><Icon name="arrowLeft" className="size-3.5" /></button><span className="flex size-7 items-center justify-center rounded-lg bg-ink-900 text-white">1</span><button type="button" disabled className="flex size-7 items-center justify-center rounded-lg border border-line text-ink-300"><Icon name="arrowRight" className="size-3.5" /></button></div>
      </div>
    </div>
  );
}