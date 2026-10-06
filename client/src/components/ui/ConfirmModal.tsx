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
}: ConfirmModalProps) => (
  <Modal open={open} onClose={loading ? () => {} : onClose} title={title}>
    <div className="flex flex-col gap-4">
      {destructive && (
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--danger)/15 text-(--danger) ring-1 ring-(--danger)/25"
          aria-hidden
        >
          <TrashIcon className="h-5 w-5" />
        </div>
      )}
      <p className="text-sm leading-relaxed text-(--muted)">{description}</p>
    </div>
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
