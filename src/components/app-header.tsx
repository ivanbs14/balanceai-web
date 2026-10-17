"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { AIComingSoonModal } from "@/components/ai-coming-soon-modal";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const aiButtonRef = useRef<HTMLButtonElement>(null);
  const [isAIComingSoonOpen, setIsAIComingSoonOpen] = useState(false);
  const closeAIComingSoon = useCallback(() => setIsAIComingSoonOpen(false), []);

  return (
    <>
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto w-full max-w-none px-1 py-2.5 sm:max-w-[1440px] sm:px-6 sm:py-4 lg:relative lg:px-10">
          <div className="relative z-0 flex items-center">
            <Image
              src="/logonameai.svg"
              alt="Balance-ai"
              width={220}
              height={48}
              className="pointer-events-none h-9 sm:h-12"
              style={{ width: "auto" }}
              priority
            />
          </div>

          <nav
            className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[0.88rem] text-foreground sm:mt-4 sm:gap-3 sm:text-[1.1rem] lg:absolute lg:top-1/2 lg:left-1/2 lg:z-50 lg:mt-0 lg:w-max lg:-translate-x-1/2 lg:-translate-y-1/2"
            aria-label="Navegação principal"
          >
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-current={pathname === "/" ? "page" : undefined}
              className={
                pathname === "/"
                  ? "relative z-50 cursor-pointer border-0 border-b-3 border-primary bg-transparent pb-1 font-semibold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring sm:border-b-4 sm:pb-2"
                  : "relative z-50 cursor-pointer border-0 bg-transparent pb-1 outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring sm:pb-2"
              }
            >
              Dashboard
            </button>
            <button
              ref={aiButtonRef}
              type="button"
              onClick={() => setIsAIComingSoonOpen(true)}
              aria-haspopup="dialog"
              aria-current={pathname === "/ai-feedback" ? "page" : undefined}
              className={
                pathname === "/ai-feedback"
                  ? "relative z-50 cursor-pointer border-0 border-b-3 border-primary bg-transparent pb-1 font-semibold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring sm:border-b-4 sm:pb-2"
                  : "relative z-50 cursor-pointer border-0 bg-transparent pb-1 outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring sm:pb-2"
              }
            >
              IA Feedback
            </button>
          </nav>
        </div>
      </header>

      <AIComingSoonModal
        isOpen={isAIComingSoonOpen}
        onClose={closeAIComingSoon}
        returnFocusRef={aiButtonRef}
      />
    </>
  );
}
