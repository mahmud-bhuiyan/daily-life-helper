import { useState, type SubmitEvent } from "react";
import { PageHeader } from "../../components/layout";
import {
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  ErrorBanner,
  Input,
  PencilIcon,
  Select,
  SkeletonRows,
  TrashIcon,
} from "../../components/ui";
import {
  useAuth,
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../../hooks";
import { splitCategoriesByScope, categoryNameError, CATEGORY_NAME_MAX_LENGTH } from "../../lib/categories";
import { ApiError } from "../../lib/api";
import type { Category } from "../../types";
import { CategoryEditModal } from "./components/CategoryEditModal";

type CategoryRowProps = {
  category: Category;
  canManage: boolean;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

const CategoryRow = ({
  category,
  canManage,
  deleting,
  onEdit,
  onDelete,
}: CategoryRowProps) => (
  <li
    className="flex min-h-11 flex-wrap items-center justify-between gap-3 rounded-(--radius-input) border border-(--border)/60 bg-(--bg)/40 px-3 py-2"
  >
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="h-3 w-3 shrink-0 rounded-full ring-1 ring-(--border)"
        style={{ backgroundColor: category.color }}
        aria-hidden
      />
      <span className="truncate font-medium text-(--text)">{category.name}</span>
      <Badge variant={category.scope === "global" ? "success" : "muted"}>
        {category.scope === "global" ? "Global" : "Mine"}
      </Badge>
    </div>
    {canManage && (
      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-2.5"
          onClick={onEdit}
          aria-label={`Edit ${category.name}`}
        >
          <PencilIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-2.5 text-(--danger) hover:border-(--danger)/30 hover:bg-(--danger)/10"
          onClick={onDelete}
          disabled={deleting}
          aria-label={`Delete ${category.name}`}
        >
          <TrashIcon />
        </Button>
      </div>
    )}
  </li>
);

export const CategoriesPage = () => {
  const { isSuperAdmin } = useAuth();
  const { data: categories = [], isPending, isError, error, refetch } =
    useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [name, setName] = useState("");
  const [addScope, setAddScope] = useState<"user" | "global">("user");
  const [formError, setFormError] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [actionError, setActionError] = useState("");

  const loading = isPending && categories.length === 0;
  const { global, user } = splitCategoriesByScope(categories);

  const canManageCategory = (category: Category) =>
    category.scope === "user" || isSuperAdmin;

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const nameErr = categoryNameError(trimmed);
    if (nameErr) {
      setFormError(nameErr);
      return;
    }

    setFormError("");
    try {
      await createCategory.mutateAsync({
        name: trimmed,
        ...(isSuperAdmin && addScope === "global" ? { scope: "global" } : {}),
      });
      setName("");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create category",
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleting) return;

    const target = deleting;
    setDeleting(null);
    setActionError("");
    deleteCategory.mutate(target.id, {
      onError: (err) => {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to delete category";
        setActionError(message);
      },
    });
  };

  return (
    <>
      <PageHeader
        title="Categories"
        description="Global categories are shared. You can edit or delete yours anytime; globals only if you are super admin and no expenses use them."
      />

      {actionError && (
        <p
          role="alert"
          className="mb-6 rounded-(--radius-card) border border-(--danger)/40 bg-(--danger)/10 px-4 py-3 text-sm text-(--text)"
        >
          {actionError}
        </p>
      )}

      <Card className="mb-6">
        <h2 className="text-sm font-medium text-(--text)">
          {isSuperAdmin ? "Add category" : "Add my category"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          {isSuperAdmin && (
            <Select
              label="Scope"
              value={addScope}
              onChange={(e) => setAddScope(e.target.value as "user" | "global")}
              className="w-full sm:w-40"
            >
              <option value="user">My category</option>
              <option value="global">Global (shared)</option>
            </Select>
          )}
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={CATEGORY_NAME_MAX_LENGTH}
            placeholder={
              isSuperAdmin && addScope === "global"
                ? "e.g. Subscriptions"
                : "e.g. Pet care"
            }
            className="min-w-0 flex-1"
          />
          <Button
            type="submit"
            disabled={!name.trim()}
            className="w-full sm:w-auto"
          >
            {isSuperAdmin && addScope === "global" ? "Add global" : "Add category"}
          </Button>
        </form>
        {formError && (
          <p role="alert" className="mt-3 text-sm text-(--danger)">
            {formError}
          </p>
        )}
      </Card>

      {isError && !categories.length && (
        <ErrorBanner
          message={
            error instanceof Error ? error.message : "Failed to load categories"
          }
          onRetry={() => refetch()}
        />
      )}

      {loading && (
        <SkeletonRows count={6} rowClassName="h-11 rounded-(--radius-input) bg-(--surface)" />
      )}

      {!loading && !isError && categories.length === 0 && (
        <EmptyState
          title="No categories"
          description="Run server migrations to seed global categories."
        />
      )}

      {!loading && categories.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card header={<h2 className="text-sm font-medium text-(--text)">Global</h2>}>
            {global.length === 0 ? (
              <p className="text-sm text-(--muted)">No global categories yet.</p>
            ) : (
              <ul className="space-y-2">
                {global.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    canManage={canManageCategory(category)}
                    deleting={false}
                    onEdit={() => setEditing(category)}
                    onDelete={() => setDeleting(category)}
                  />
                ))}
              </ul>
            )}
            {!isSuperAdmin && global.length > 0 && (
              <p className="mt-4 text-xs text-(--muted)">
                Global categories can only be edited or deleted by a super admin.
              </p>
            )}
          </Card>

          <Card header={<h2 className="text-sm font-medium text-(--text)">My categories</h2>}>
            {user.length === 0 ? (
              <EmptyState
                title="No custom categories"
                description="Add one above — it will appear here and in expense forms."
              />
            ) : (
              <ul className="space-y-2">
                {user.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    canManage={canManageCategory(category)}
                    deleting={false}
                    onEdit={() => setEditing(category)}
                    onDelete={() => setDeleting(category)}
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      <ConfirmModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete category?"
        description={
          deleting ? (
            <>
              Remove{" "}
              <span className="font-medium text-(--text)">{deleting.name}</span>
              ? This only works if no expenses use this category. This cannot be
              undone.
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Delete"
        destructive
      />

      <CategoryEditModal
        open={editing !== null}
        category={editing}
        onClose={() => setEditing(null)}
        onSubmit={async (id, input) => {
          setActionError("");
          try {
            await updateCategory.mutateAsync({ id, ...input });
          } catch (err) {
            const message =
              err instanceof ApiError
                ? err.message
                : err instanceof Error
                  ? err.message
                  : "Failed to update category";
            throw new Error(message);
          }
        }}
      />
    </>
  );
};
