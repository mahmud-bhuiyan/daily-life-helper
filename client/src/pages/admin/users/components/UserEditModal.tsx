import { useEffect, useState, type SubmitEvent } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
} from "../../../../components/ui";
import type { UpdateUserInput, UserAdmin, UserRole } from "../../../../types";

type UserEditModalProps = {
  user: UserAdmin | null;
  open: boolean;
  isSelf: boolean;
  onClose: () => void;
  onSubmit: (id: string, input: UpdateUserInput) => Promise<void>;
};

export const UserEditModal = ({
  user,
  open,
  isSelf,
  onClose,
  onSubmit,
}: UserEditModalProps) => {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && user) {
      setEmail(user.email);
      setDisplayName(user.displayName);
      setRole(user.role);
      setError("");
    }
  }, [open, user]);

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSubmitting(true);

    try {
      const input: UpdateUserInput = {};
      if (email.trim() !== user.email) input.email = email.trim();
      if (displayName.trim() !== user.displayName) {
        input.displayName = displayName.trim();
      }
      if (!isSelf && role !== user.role) input.role = role;

      if (!input.email && !input.displayName && !input.role) {
        handleClose();
        return;
      }

      await onSubmit(user.id, input);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Edit user">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          required
          disabled={isSelf}
        >
          <option value="user">User</option>
          <option value="super_admin">Super admin</option>
        </Select>
        {isSelf && (
          <p className="text-xs text-(--muted)">You cannot change your own role.</p>
        )}

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
            disabled={submitting || !user?.isActive}
            className="w-full sm:w-auto"
          >
            {submitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
