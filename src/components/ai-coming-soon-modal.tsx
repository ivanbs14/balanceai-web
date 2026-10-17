"use client";

import { Sparkles, X } from "lucide-react";
import { useEffect, useRef, type RefObject } from "react";

type AIComingSoonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
};

export function AIComingSoonModal({
  isOpen,
  onClose,
  returnFocusRef,
}: AIComingSoonModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const acknowledgeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const returnFocusElement = returnFocusRef.current;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const firstButton = closeButtonRef.current;
      const lastButton = acknowledgeButtonRef.current;

      if (!firstButton || !lastButton) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault();
        lastButton.focus();
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault();
        firstButton.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      returnFocusElement?.focus();
    };
  }, [isOpen, onClose, returnFocusRef]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay px-4 py-8 backdrop-blur-[3px]"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-[520px] overflow-hidden rounded-[1rem] border-2 border-ring bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.38)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-coming-soon-title"
        aria-describedby="ai-coming-soon-description"
      >
        <div className="flex items-center justify-between bg-ring px-4 py-4 text-white sm:px-6 sm:py-5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/12 sm:h-11 sm:w-11">
              <Sparkles size={20} strokeWidth={2.2} aria-hidden />
            </span>
            <h2
              id="ai-coming-soon-title"
              className="text-lg font-semibold tracking-tight sm:text-2xl"
            >
              IA Feedback em breve
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar aviso"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-10 sm:w-10"
          >
            <X size={22} strokeWidth={2.2} aria-hidden />
          </button>
        </div>

        <div className="space-y-5 px-4 py-5 sm:px-8 sm:py-8">
          <p
            id="ai-coming-soon-description"
            className="text-sm leading-6 text-muted sm:text-base"
          >
            Estamos preparando uma experiência de análise financeira com IA.
            Essa funcionalidade estará disponível em breve.
          </p>

          <div className="flex justify-end">
            <button
              ref={acknowledgeButtonRef}
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-[0.7rem] bg-ring px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
