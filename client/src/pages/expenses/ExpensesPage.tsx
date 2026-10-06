import { useMemo, useState } from "react";
import { PageHeader } from "../../components/layout";
import { CategorySelect } from "../../components/forms/CategorySelect";
import { ExpenseForm } from "../../components/forms/ExpenseForm";
import {
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  ErrorBanner,
  Modal,
  Select,
  SkeletonRows,
} from "../../components/ui";
import {
  useCategories,
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useItems,
  useUpdateExpense,
} from "../../hooks";
import {
  dateInputToFromIso,
  dateInputToToIso,
  formatMoney,
  formatSpentAt,
} from "../../lib/format";
import type {
  CreateExpenseInput,
  Expense,
  ExpenseListFilters,
} from "../../types";
import { ExpenseTable } from "./components/ExpenseTable";

export const ExpensesPage = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [itemId, setItemId] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>();
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const filters: ExpenseListFilters = useMemo(
    () => ({
      from: fromDate ? dateInputToFromIso(fromDate) : undefined,
      to: toDate ? dateInputToToIso(toDate) : undefined,
      categoryId: categoryId || undefined,
      itemId: itemId || undefined,
      page,
      limit: 20,
    }),
    [fromDate, toDate, categoryId, itemId, page],
  );

  const { data: categories = [] } = useCategories();
  const { data: items = [] } = useItems();
  const { data, isPending, isError, error, refetch } = useExpenses(filters);
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const expenses = data?.data ?? [];
  const meta = data?.meta;
  const showSkeleton = isPending && !data;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(undefined);
  };

  const handleDeleteRequest = (expense: Expense) => {
    setDeleting(expense);
  };

  const handleDeleteConfirm = () => {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    deleteExpense.mutate(target.id);
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setCategoryId("");
    setItemId("");
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Track spending with categories and optional items for price history later."
        action={<Button onClick={openCreate}>Add expense</Button>}
      />

      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-(--text)">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="min-h-11 w-full rounded-(--radius-input) border border-(--border) bg-(--bg)/80 px-4 py-2.5 text-sm text-(--text)"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-(--text)">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="min-h-11 w-full rounded-(--radius-input) border border-(--border) bg-(--bg)/80 px-4 py-2.5 text-sm text-(--text)"
            />
          </div>
          <CategorySelect
            label="Category"
            value={categoryId}
            onChange={(id) => {
              setCategoryId(id);
              setPage(1);
            }}
            categories={categories}
          />
          <Select
            label="Item"
            value={itemId}
            onChange={(e) => {
              setItemId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </Card>

      {showSkeleton && <SkeletonRows count={3} />}

      {isError && !data && (
        <ErrorBanner
          message={
            error instanceof Error ? error.message : "Could not load expenses."
          }
          onRetry={() => refetch()}
        />
      )}

      {!showSkeleton && !isError && expenses.length === 0 && (
        <EmptyState
          title="No expenses yet"
          description="Add your first expense or adjust filters."
          actionLabel="Add expense"
          onAction={openCreate}
        />
      )}

      {expenses.length > 0 && (
        <>
          <ExpenseTable
            expenses={expenses}
            onEdit={openEdit}
            onDelete={handleDeleteRequest}
          />

          {meta && meta.total > meta.limit && (
            <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-(--muted)">
                Page {meta.page} of {totalPages} · {meta.total} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit expense" : "Add expense"}
      >
        <ExpenseForm
          key={editing?.id ?? "new"}
          initial={editing}
          onCancel={closeModal}
          onSubmit={async (input) => {
            if (editing) {
              await updateExpense.mutateAsync({ id: editing.id, ...input });
            } else {
              await createExpense.mutateAsync(input as CreateExpenseInput);
            }
            closeModal();
          }}
        />
      </Modal>

      <ConfirmModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete expense?"
        description={
          deleting ? (
            <>
              This permanently removes{" "}
              <span className="font-medium text-(--text)">
                {formatMoney(deleting.amountMinor, deleting.currency)}
              </span>{" "}
              from{" "}
              <span className="font-medium text-(--text)">
                {formatSpentAt(deleting.spentAt)}
              </span>
              . This cannot be undone.
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Delete"
        destructive
      />
    </>
  );
};
