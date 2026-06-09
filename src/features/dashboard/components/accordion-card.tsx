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
  compact?: boolean;
  flushHorizontalPadding?: boolean;
  borderless?: boolean;
  minimalHorizontalPaddingOnMobile?: boolean;
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
  compact = false,
  flushHorizontalPadding = false,
  borderless = false,
  minimalHorizontalPaddingOnMobile = false,
}: AccordionCardProps) {
  return (
    <details
      className={[
        "group min-w-0 bg-surface",
        borderless ? "" : "border border-border",
      ].join(" ")}
      open={defaultOpen}
    >
      <summary
        className={[
          "flex cursor-pointer list-none items-center justify-between",
          compact ? "gap-2 py-3 sm:gap-4 sm:py-4" : "gap-4 py-4",
          flushHorizontalPadding
            ? minimalHorizontalPaddingOnMobile
              ? "px-1 sm:px-5"
              : "px-0 sm:px-5"
            : compact
              ? "px-3 sm:px-5"
              : "px-5",
        ].join(" ")}
      >
        <div className={["flex min-w-0 items-center", compact ? "gap-2" : "gap-3"].join(" ")}>
          <span
            aria-hidden
            className={[
              "leading-none text-muted transition-transform duration-200 group-open:rotate-180",
              compact ? "text-lg sm:text-xl" : "text-xl",
            ].join(" ")}
          >
            ▾
          </span>
          <div className={["flex min-w-0 flex-wrap items-center", compact ? "gap-2" : "gap-3"].join(" ")}>
            <h2
              className={[
                "font-semibold tracking-tight text-primary",
                compact ? "text-[1rem] sm:text-[1.45rem]" : "text-[1.35rem] sm:text-[1.45rem]",
              ].join(" ")}
            >
              {title}
            </h2>
            {titleBadge ? (
              <span
                className={[
                  "inline-flex items-center rounded-full bg-[#ffd8e6] font-mono uppercase text-[#d61b72]",
                  compact
                    ? "px-2 py-0.5 text-[0.58rem] tracking-[0.18em] sm:px-3 sm:py-1 sm:text-[0.68rem] sm:tracking-[0.24em]"
                    : "px-3 py-1 text-[0.68rem] tracking-[0.24em]",
                ].join(" ")}
              >
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
                className={[
                  "inline-flex items-center border-b border-transparent pt-0.5 font-medium text-[#d61b72] transition hover:border-[#d61b72] hover:text-[#b31660]",
                  compact ? "text-[0.78rem] sm:text-sm" : "text-sm",
                ].join(" ")}
              >
                {titleActionLabel}
              </button>
            ) : null}
          </div>
        </div>
        <div className={["flex items-center", compact ? "h-7 gap-2 sm:h-8 sm:gap-3" : "h-8 gap-3"].join(" ")}>
          {showPlusBeforeTotal ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onPlusClick?.();
              }}
              aria-label={`Adicionar item em ${title}`}
              className={[
                "inline-flex items-center justify-center rounded-full text-primary transition hover:bg-green-100 hover:text-green-700",
                compact ? "h-7 w-7 sm:h-9 sm:w-9" : "h-9 w-9",
              ].join(" ")}
            >
              <Plus size={compact ? 20 : 28} strokeWidth={2.2} />
            </button>
          ) : null}
          {total ? (
            <p
              className={[
                "flex h-full items-center font-semibold leading-none text-foreground",
                compact ? "text-[1rem] sm:text-[1.45rem]" : "text-[1.3rem] sm:text-[1.45rem]",
              ].join(" ")}
            >
              {total}
            </p>
          ) : null}
        </div>
      </summary>
      <div
        className={[
          "pt-4",
          borderless ? "sm:border-t sm:border-border" : "border-t border-border",
          flushHorizontalPadding
            ? minimalHorizontalPaddingOnMobile
              ? "px-1 pb-0 sm:p-5"
              : "px-0 pb-0 sm:p-5"
            : compact
              ? "px-3 pb-3 sm:p-5"
              : "p-5",
        ].join(" ")}
      >
        {children}
      </div>
    </details>
  );
}
