import { useState, type ChangeEvent } from "react";
import { Button, Input, Select } from "../ui";
import type { Item } from "../../types";

const CREATE_VALUE = "__create_item__";

type ItemSelectProps = {
  label?: string;
  value: string;
  onChange: (itemId: string) => void;
  items: Item[];
  allowNone?: boolean;
  noneLabel?: string;
  allowCreate?: boolean;
  onCreateItem?: (name: string, unit?: string) => Promise<void>;
  creating?: boolean;
};

export const ItemSelect = ({
  label = "Item",
  value,
  onChange,
  items,
  allowNone = true,
  noneLabel = "None",
  allowCreate = false,
  onCreateItem,
  creating = false,
}: ItemSelectProps) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    if (next === CREATE_VALUE) {
      setShowCreate(true);
      return;
    }
    setShowCreate(false);
    onChange(next);
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name || !onCreateItem) return;
    await onCreateItem(name, newUnit.trim() || undefined);
    setNewName("");
    setNewUnit("");
    setShowCreate(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Select label={label} value={value} onChange={handleSelectChange}>
        {allowNone && <option value="">{noneLabel}</option>}
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
            {item.unit ? ` (${item.unit})` : ""}
          </option>
        ))}
        {allowCreate && <option value={CREATE_VALUE}>+ Add item…</option>}
      </Select>

      {allowCreate && showCreate && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Input
            label="New item"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Input
            label="Unit"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            placeholder="kg, pcs"
            className="sm:w-28"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="w-full sm:w-auto"
          >
            {creating ? "Adding…" : "Add"}
          </Button>
        </div>
      )}
    </div>
  );
};
