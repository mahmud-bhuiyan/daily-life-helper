import { useEffect, useState, type SubmitEvent } from "react";
import { Button, Modal, PasswordInput } from "../../../../components/ui";
import type { UserAdmin } from "../../../../types";

type UserResetPasswordModalProps = {
  user: UserAdmin | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, password: string) => Promise<void>;
};

export const UserResetPasswordModal = ({
  user,
  open,
  onClose,
  onSubmit,
}: UserResetPasswordModalProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setError("");
    }
  }, [open, user?.id]);

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSubmitting(true);

    try {
      await onSubmit(user.id, password);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={user ? `Reset password — ${user.displayName}` : "Reset password"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-(--muted)">
          Set a new password for <span className="text-(--text)">{user?.email}</span>.
        </p>
        <PasswordInput
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          hint="Minimum 8 characters"
          required
        />

        {error && (
          <p role="alert" className="text-sm text-(--danger)">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? "Saving…" : "Update password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
