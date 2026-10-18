import {
  Badge,
  Button,
  Card,
  DataTable,
  type DataTableColumn,
  PencilIcon,
  Tooltip,
  TrashIcon,
} from "../../../components/ui";
import { formatMoney, formatSpentAt } from "../../../lib/format";
import type { Expense } from "../../../types";

type ExpenseTableProps = {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  deletingId?: string;
};

const expenseColumns = (
  onEdit: (expense: Expense) => void,
  onDelete: (expense: Expense) => void,
  deletingId?: string,
): DataTableColumn<Expense>[] => [
  {
    id: "when",
    header: "When",
    width: "18%",
    cellClassName: "whitespace-nowrap text-(--text)",
    render: (expense) => formatSpentAt(expense.spentAt),
  },
  {
    id: "amount",
    header: "Amount",
    width: "12%",
    cellClassName: "font-medium text-(--text)",
    render: (expense) => formatMoney(expense.amountMinor, expense.currency),
  },
  {
    id: "category",
    header: "Category",
    width: "16%",
    cellClassName: "text-(--muted)",
    render: (expense) => expense.categoryName ?? "—",
  },
  {
    id: "item",
    header: "Item",
    width: "16%",
    cellClassName: "text-(--muted)",
    render: (expense) => expense.itemName ?? "—",
  },
  {
    id: "note",
    header: "Note",
    width: "28%",
    cellClassName: "truncate text-(--muted)",
    render: (expense) => expense.note ?? "—",
  },
  {
    id: "actions",
    header: "Actions",
    width: "10%",
    headerAlign: "right",
    cellAlign: "right",
    render: (expense) => (
      <div className="flex justify-end gap-1">
        <Tooltip label="Edit expense">
          <Button
            variant="ghost"
            size="sm"
            className="px-2.5"
            onClick={() => onEdit(expense)}
            aria-label="Edit expense"
          >
            <PencilIcon />
          </Button>
        </Tooltip>
        <Tooltip
          label={
            deletingId === expense.id ? "Deleting…" : "Delete expense"
          }
        >
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
        </Tooltip>
      </div>
    ),
  },
];

export const ExpenseTable = ({
  expenses,
  onEdit,
  onDelete,
  deletingId,
}: ExpenseTableProps) => (
  <DataTable
    data={expenses}
    getRowKey={(expense) => expense.id}
    columns={expenseColumns(onEdit, onDelete, deletingId)}
    variant="plain"
    renderMobileRow={(expense) => (
      <Card padding="default">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-semibold text-(--text)">
              {formatMoney(expense.amountMinor, expense.currency)}
            </p>
            <p className="text-sm text-(--muted)">
              {formatSpentAt(expense.spentAt)}
            </p>
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
          <Tooltip label="Edit expense">
            <Button
              variant="ghost"
              size="sm"
              className="px-2.5"
              onClick={() => onEdit(expense)}
              aria-label="Edit expense"
            >
              <PencilIcon />
            </Button>
          </Tooltip>
          <Tooltip
            label={
              deletingId === expense.id ? "Deleting…" : "Delete expense"
            }
          >
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
          </Tooltip>
        </div>
      </Card>
    )}
  />
);
