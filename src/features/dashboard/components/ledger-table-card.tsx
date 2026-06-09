import type { ReactNode } from "react";

type LedgerColumn<T> = {
  key: string;
  header: ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
  render: (row: T) => ReactNode;
};

type LedgerTableCardProps<T> = {
  title: string;
  total: string;
  rows: T[];
  columns: Array<LedgerColumn<T>>;
  addLabel?: string;
  hideHeader?: boolean;
  embedded?: boolean;
  compact?: boolean;
  flushHorizontalPadding?: boolean;
  borderlessOnMobile?: boolean;
};

export function LedgerTableCard<T>({
  title,
  total,
  rows,
  columns,
  addLabel,
  hideHeader = false,
  embedded = false,
  compact = false,
  flushHorizontalPadding = false,
  borderlessOnMobile = false,
}: LedgerTableCardProps<T>) {
  const gridTemplateColumns = columns
    .map((column) => column.width ?? "minmax(0, 1fr)")
    .join(" ");

  return (
    <article className={embedded ? "min-w-0" : "min-w-0 border border-border bg-surface p-5"}>
      {!hideHeader ? (
        <div className="flex items-start justify-between gap-4">
          <h2
            className={[
              "font-semibold tracking-tight text-primary",
              compact ? "text-[1rem] sm:text-[1.05rem]" : "text-[1.35rem] sm:text-[1.45rem]",
            ].join(" ")}
          >
            {title}
          </h2>
          <p
            className={[
              "font-semibold text-foreground",
              compact ? "pt-1 text-[1rem] sm:text-[1.05rem]" : "pt-2 text-[1.3rem] sm:text-[1.45rem]",
            ].join(" ")}
          >
            {total}
          </p>
        </div>
      ) : null}

      <div
        className={[
          "min-w-0 w-full max-w-full overflow-x-auto sm:overflow-hidden",
          borderlessOnMobile ? "border-0 sm:border sm:border-border" : "border border-border",
          hideHeader ? "mt-0" : "mt-5",
        ].join(" ")}
      >
        <div
          className="grid min-w-max bg-surface-soft sm:min-w-0"
          style={{
            gridTemplateColumns,
          }}
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className={[
                "font-mono uppercase text-primary",
                borderlessOnMobile ? "border-b-0 sm:border-b sm:border-border" : "border-b border-border",
                flushHorizontalPadding ? "px-1 sm:px-4" : "px-4",
                compact
                  ? "py-1.5 text-[0.58rem] tracking-[0.12em] sm:py-2 sm:text-[0.7rem] sm:tracking-[0.18em]"
                  : "py-2 text-[0.65rem] tracking-[0.18em] sm:text-[0.7rem]",
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
            className={[
              "grid min-w-max last:border-b-0 sm:min-w-0",
              borderlessOnMobile ? "border-b-0 sm:border-b sm:border-border" : "border-b border-border",
            ].join(" ")}
            style={{
              gridTemplateColumns,
            }}
          >
            {columns.map((column) => (
              <div
                key={column.key}
                className={[
                  "text-foreground",
                  flushHorizontalPadding ? "px-1 sm:px-4" : "px-4",
                  compact ? "py-2 text-[0.8rem] sm:py-2.5 sm:text-[0.95rem]" : "py-2.5 text-sm sm:text-[0.95rem]",
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

      {addLabel ? (
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-3 border border-dashed border-border px-4 py-4 text-lg text-muted sm:text-xl"
        >
          <span className="text-2xl leading-none sm:text-3xl">+</span>
          <span>{addLabel}</span>
        </button>
      ) : null}
    </article>
  );
}
