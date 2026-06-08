import type { ReactNode } from "react";
import { Plus } from "lucide-react";

type AccordionCardProps = {
  title: string;
  titleBadge?: string;
  titleActionLabel?: string;
  total?: string;
  showPlusBeforeTotal?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
  onPlusClick?: () => void;
  onTitleActionClick?: () => void;
};

export function AccordionCard({
  title,
  titleBadge,
  titleActionLabel,
  total,
  showPlusBeforeTotal = false,
  defaultOpen = false,
  children,
  onPlusClick,
  onTitleActionClick,
}: AccordionCardProps) {
  return (
    <details className="group border border-border bg-surface" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="text-xl leading-none text-muted transition-transform duration-200 group-open:rotate-180"
          >
            ▾
          </span>
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h2 className="text-[1.35rem] font-semibold tracking-tight text-primary sm:text-[1.45rem]">
              {title}
            </h2>
            {titleBadge ? (
              <span className="inline-flex items-center rounded-full bg-[#ffd8e6] px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.24em] text-[#d61b72]">
                {titleBadge}
              </span>
            ) : null}
            {titleActionLabel ? (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onTitleActionClick?.();
                }}
                className="inline-flex items-center border-b border-transparent pt-0.5 text-sm font-medium text-[#d61b72] transition hover:border-[#d61b72] hover:text-[#b31660]"
              >
                {titleActionLabel}
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex h-8 items-center gap-3">
          {showPlusBeforeTotal ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onPlusClick?.();
              }}
              aria-label={`Adicionar item em ${title}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-primary transition hover:bg-green-100 hover:text-green-700"
            >
              <Plus size={28} strokeWidth={2.2} />
            </button>
          ) : null}
          {total ? (
            <p className="flex h-full items-center text-[1.3rem] font-semibold leading-none text-foreground sm:text-[1.45rem]">
              {total}
            </p>
          ) : null}
        </div>
      </summary>
      <div className="border-t border-border p-5 pt-4">{children}</div>
    </details>
  );
}
