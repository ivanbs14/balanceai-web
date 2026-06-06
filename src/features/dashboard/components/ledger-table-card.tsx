import type { ReactNode } from "react";

type LedgerColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  render: (row: T) => ReactNode;
};

type LedgerTableCardProps<T> = {
  title: string;
  total: string;
  rows: T[];
  columns: Array<LedgerColumn<T>>;
  addLabel: string;
};

export function LedgerTableCard<T>({
  title,
  total,
  rows,
  columns,
  addLabel,
}: LedgerTableCardProps<T>) {
  return (
    <article className="border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[2rem] font-semibold tracking-tight text-primary">
          {title}
        </h2>
        <p className="pt-2 text-3xl font-semibold text-foreground">{total}</p>
      </div>

      <div className="mt-5 overflow-hidden border border-border">
        <div
          className="grid bg-surface-soft"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className={[
                "border-b border-border px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] text-primary",
                column.align === "right"
                  ? "text-right"
                  : column.align === "center"
                    ? "text-center"
                    : "text-left",
              ].join(" ")}
            >
              {column.header}
            </div>
          ))}
        </div>

        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="grid border-b border-border last:border-b-0"
            style={{
              gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
            }}
          >
            {columns.map((column) => (
              <div
                key={column.key}
                className={[
                  "px-4 py-4 text-lg text-foreground",
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                      ? "text-center"
                      : "text-left",
                ].join(" ")}
              >
                {column.render(row)}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-3 border border-dashed border-border px-4 py-4 text-2xl text-muted"
      >
        <span className="text-4xl leading-none">+</span>
        <span>{addLabel}</span>
      </button>
    </article>
  );
}
