import type { ReactNode } from "react";
import { Button } from "./Button";
import { TrashIcon } from "./icons";
import { Modal } from "./Modal";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  /** Defaults to trash when `destructive` is true. */
  icon?: ReactNode;
};

export const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  destructive = false,
  icon,
}: ConfirmModalProps) => (
  <Modal open={open} onClose={loading ? () => {} : onClose} title={title}>
    <div className="flex flex-col items-start gap-4 sm:flex-row">
      {destructive && (
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-(--radius-card) bg-(--danger)/10 text-(--danger) ring-1 ring-(--danger)/25 shadow-elevated"
          aria-hidden
        >
          {icon ?? <TrashIcon className="h-6 w-6" />}
        </div>
      )}
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm leading-relaxed text-(--text)/90">{description}</p>
      </div>
    </div>

    <div
      className="-mx-5 -mb-5 mt-6 flex flex-col-reverse gap-2.5 border-t border-(--border)/80 bg-(--bg)/50 px-5 py-4 sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:px-6"
    >
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {cancelLabel}
      </Button>
      <Button
        type="button"
        variant={destructive ? "danger" : "primary"}
        onClick={() => void onConfirm()}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? "Please wait…" : confirmLabel}
      </Button>
    </div>
  </Modal>
);
