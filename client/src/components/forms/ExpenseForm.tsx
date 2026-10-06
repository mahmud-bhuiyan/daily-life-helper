import { useState, type SubmitEvent } from "react";
import { Button, Input, Select } from "../ui";
import {
  useCategories,
  useCreateItem,
  useItems,
} from "../../hooks";
import {
  fromDateTimeLocalValue,
  parseMoneyToMinor,
  toDateTimeLocalValue,
} from "../../lib/format";
import type { CreateExpenseInput, Expense, UpdateExpenseInput } from "../../types";

type ExpenseFormProps = {
  initial?: Expense;
  onSubmit: (input: CreateExpenseInput | UpdateExpenseInput) => Promise<void>;
  onCancel: () => void;
};

export const ExpenseForm = ({ initial, onSubmit, onCancel }: ExpenseFormProps) => {
  const { data: categories = [] } = useCategories();
  const { data: items = [] } = useItems();
  const createItem = useCreateItem();

  const [amount, setAmount] = useState(() =>
    initial ? String(initial.amountMinor / 100) : "",
  );
  const [categoryId, setCategoryId] = useState(() => initial?.categoryId ?? "");
  const [itemId, setItemId] = useState(() => initial?.itemId ?? "");
  const [quantity, setQuantity] = useState(() =>
    initial?.quantity != null ? String(initial.quantity) : "",
  );
  const [unitPrice, setUnitPrice] = useState(() =>
    initial?.unitPrice != null ? String(initial.unitPrice) : "",
  );
  const [note, setNote] = useState(() => initial?.note ?? "");
  const [spentAt, setSpentAt] = useState(() =>
    initial
      ? toDateTimeLocalValue(initial.spentAt)
      : toDateTimeLocalValue(new Date().toISOString()),
  );
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateItem = async () => {
    if (!newItemName.trim()) return;
    setError("");
    try {
      const item = await createItem.mutateAsync({
        name: newItemName.trim(),
        unit: newItemUnit.trim() || undefined,
      });
      setItemId(item.id);
      setNewItemName("");
      setNewItemUnit("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
    }
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError("");

    const amountMinor = parseMoneyToMinor(amount);
    if (amountMinor === null) {
      setError("Enter a valid amount");
      return;
    }

    const payload: CreateExpenseInput = {
      amountMinor,
      categoryId: categoryId || undefined,
      itemId: itemId || undefined,
      quantity: quantity ? Number(quantity) : undefined,
      unitPrice: unitPrice ? Number(unitPrice) : undefined,
      note: note.trim() || undefined,
      spentAt: fromDateTimeLocalValue(spentAt),
    };

    if (payload.quantity !== undefined && !Number.isFinite(payload.quantity)) {
      setError("Invalid quantity");
      return;
    }
    if (payload.unitPrice !== undefined && !Number.isFinite(payload.unitPrice)) {
      setError("Invalid unit price");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Amount (৳)"
        type="text"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        placeholder="0.00"
      />

      <Select
        label="Category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">None</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Select
        label="Item (optional)"
        value={itemId}
        onChange={(e) => setItemId(e.target.value)}
      >
        <option value="">None</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
            {item.unit ? ` (${item.unit})` : ""}
          </option>
        ))}
      </Select>

      <div className="rounded-(--radius-input) border border-(--border) bg-(--bg)/40 p-3">
        <p className="text-xs font-medium text-(--muted)">Quick add item</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
          <Input
            label="Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1"
          />
          <Input
            label="Unit"
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            placeholder="kg, pcs"
            className="sm:w-28"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={handleCreateItem}
            disabled={createItem.isPending || !newItemName.trim()}
            className="w-full sm:w-auto"
          >
            {createItem.isPending ? "Adding…" : "Add item"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Quantity"
          type="text"
          inputMode="decimal"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Optional"
        />
        <Input
          label="Unit price"
          type="text"
          inputMode="decimal"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          placeholder="Optional"
        />
      </div>

      <Input
        label="When"
        type="datetime-local"
        value={spentAt}
        onChange={(e) => setSpentAt(e.target.value)}
        required
      />

      <Input
        label="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional"
      />

      {error && (
        <p role="alert" className="text-sm text-(--danger)">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? "Saving…" : initial ? "Update expense" : "Add expense"}
        </Button>
      </div>
    </form>
  );
};
