import { useEffect, useState, type SubmitEvent } from "react";
import { Button, Input, Modal } from "../../../components/ui";
import { categoryNameError, CATEGORY_NAME_MAX_LENGTH } from "../../../lib/categories";
import type { Category, UpdateCategoryInput } from "../../../types";

type CategoryEditModalProps = {
  category: Category | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, input: UpdateCategoryInput) => Promise<void>;
};

export const CategoryEditModal = ({
  category,
  open,
  onClose,
  onSubmit,
}: CategoryEditModalProps) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && category) {
      setName(category.name);
      setColor(category.color);
      setError("");
    }
  }, [open, category]);

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!category) return;

    setError("");
    const nameErr = categoryNameError(name);
    if (nameErr) {
      setError(nameErr);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(category.id, {
        name: name.trim(),
        color: /^#[0-9A-Fa-f]{6}$/.test(color.trim()) ? color.trim() : undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Edit category">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={CATEGORY_NAME_MAX_LENGTH}
          required
        />
        <Input
          label="Color (hex)"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="#6366f1"
        />
        {error && (
          <p role="alert" className="text-sm text-(--danger)">{error}</p>
        )}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
