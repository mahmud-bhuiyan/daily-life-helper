import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalSize = "md" | "lg";

const sizeClass: Record<ModalSize, string> = {
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
};

export const Modal = ({
  open,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) => {
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
        aria-hidden
      />

      <div
        className={`animate-fade-in relative z-10 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-(--radius-card) border border-(--border) bg-(--surface) pb-[env(safe-area-inset-bottom,0px)] shadow-2xl sm:rounded-(--radius-card) ${sizeClass[size]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-(--border) px-5 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-(--text)">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-(--radius-input) text-(--muted) transition-colors hover:bg-(--surface-hover) hover:text-(--text)"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
};
