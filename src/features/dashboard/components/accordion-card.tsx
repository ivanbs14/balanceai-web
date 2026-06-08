import type { ReactNode } from "react";
import { Plus } from "lucide-react";

type AccordionCardProps = {
  title: string;
  total?: string;
  showPlusBeforeTotal?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function AccordionCard({
  title,
  total,
  showPlusBeforeTotal = false,
  defaultOpen = false,
  children,
}: AccordionCardProps) {
  return (
    <details className="group border border-border bg-surface" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="text-xl leading-none text-muted transition-transform duration-200 group-open:rotate-180"
          >
            ▾
          </span>
          <h2 className="text-[1.35rem] font-semibold tracking-tight text-primary sm:text-[1.45rem]">
            {title}
          </h2>
        </div>
        <div className="flex h-8 items-center gap-3">
          {showPlusBeforeTotal ? (
            <Plus size={28} strokeWidth={2.2} className="text-primary hover:text-green-600 hover:bg-green-100" />
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
