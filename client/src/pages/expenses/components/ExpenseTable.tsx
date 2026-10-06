import { Badge, Button, Card, PencilIcon, TrashIcon } from "../../../components/ui";
import { formatMoney, formatSpentAt } from "../../../lib/format";
import type { Expense } from "../../../types";

type ExpenseTableProps = {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  deletingId?: string;
};

export const ExpenseTable = ({
  expenses,
  onEdit,
  onDelete,
  deletingId,
}: ExpenseTableProps) => (
  <>
    <div className="flex flex-col gap-3 md:hidden">
      {expenses.map((expense) => (
        <Card key={expense.id} padding="default">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-semibold text-(--text)">
                {formatMoney(expense.amountMinor, expense.currency)}
              </p>
              <p className="text-sm text-(--muted)">{formatSpentAt(expense.spentAt)}</p>
            </div>
            {expense.categoryName && (
              <Badge variant="muted">{expense.categoryName}</Badge>
            )}
          </div>

          {expense.itemName && (
            <p className="mt-2 text-sm text-(--text)">Item: {expense.itemName}</p>
          )}
          {expense.note && (
            <p className="mt-1 text-sm text-(--muted)">{expense.note}</p>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="px-2.5"
              onClick={() => onEdit(expense)}
              aria-label="Edit expense"
            >
              <PencilIcon />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="px-2.5 text-(--danger) hover:border-(--danger)/30 hover:bg-(--danger)/10"
              onClick={() => onDelete(expense)}
              disabled={deletingId === expense.id}
              aria-label="Delete expense"
            >
              <TrashIcon />
            </Button>
          </div>
        </Card>
      ))}
    </div>

    <div className="hidden overflow-x-auto rounded-(--radius-card) border border-(--border) md:block">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-(--border) bg-(--surface) text-(--muted)">
          <tr>
            <th className="px-4 py-3 font-medium">When</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium">Note</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="border-b border-(--border)/60 last:border-0 hover:bg-(--surface-hover)/50"
            >
              <td className="px-4 py-3 whitespace-nowrap text-(--text)">
                {formatSpentAt(expense.spentAt)}
              </td>
              <td className="px-4 py-3 font-medium text-(--text)">
                {formatMoney(expense.amountMinor, expense.currency)}
              </td>
              <td className="px-4 py-3 text-(--muted)">
                {expense.categoryName ?? "—"}
              </td>
              <td className="px-4 py-3 text-(--muted)">{expense.itemName ?? "—"}</td>
              <td className="max-w-48 truncate px-4 py-3 text-(--muted)">
                {expense.note ?? "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2.5"
                    onClick={() => onEdit(expense)}
                    aria-label="Edit expense"
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2.5 text-(--danger) hover:border-(--danger)/30 hover:bg-(--danger)/10"
                    onClick={() => onDelete(expense)}
                    disabled={deletingId === expense.id}
                    aria-label="Delete expense"
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);
