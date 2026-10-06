import { useState, type ChangeEvent } from "react";
import { Button, Input, Select } from "../ui";
import { splitCategoriesByScope, categoryNameError, CATEGORY_NAME_MAX_LENGTH } from "../../lib/categories";
import type { Category } from "../../types";

const CREATE_VALUE = "__create_category__";

type CategorySelectProps = {
  label?: string;
  value: string;
  onChange: (categoryId: string) => void;
  categories: Category[];
  allowNone?: boolean;
  noneLabel?: string;
  allowCreate?: boolean;
  onCreateCategory?: (name: string) => Promise<void>;
  creating?: boolean;
};

export const CategorySelect = ({
  label = "Category",
  value,
  onChange,
  categories,
  allowNone = true,
  noneLabel = "All",
  allowCreate = false,
  onCreateCategory,
  creating = false,
}: CategorySelectProps) => {
  const { global, user } = splitCategoriesByScope(categories);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");

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
    if (!name || !onCreateCategory) return;
    const nameErr = categoryNameError(name);
    if (nameErr) {
      setCreateError(nameErr);
      return;
    }
    setCreateError("");
    await onCreateCategory(name);
    setNewName("");
    setShowCreate(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Select
        label={label}
        value={value}
        onChange={handleSelectChange}
      >
        {allowNone && <option value="">{noneLabel}</option>}
        {global.length > 0 && (
          <optgroup label="Global">
            {global.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </optgroup>
        )}
        {user.length > 0 && (
          <optgroup label="My categories">
            {user.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </optgroup>
        )}
        {allowCreate && (
          <option value={CREATE_VALUE}>+ Add category…</option>
        )}
      </Select>

      {allowCreate && showCreate && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Input
            label="New category"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setCreateError("");
            }}
            maxLength={CATEGORY_NAME_MAX_LENGTH}
            placeholder="e.g. Pet care"
            className="flex-1"
            autoFocus
          />
          {createError && (
            <p role="alert" className="text-sm text-(--danger) sm:col-span-2">
              {createError}
            </p>
          )}
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
