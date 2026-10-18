import type { ReactNode } from "react";

export type TableAlign = "left" | "center" | "right";

const alignClass = (align: TableAlign = "left") => {
  switch (align) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
};

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  /** Column width (e.g. `"20%"`). */
  width?: string;
  headerAlign?: TableAlign;
  cellAlign?: TableAlign;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T, index: number) => ReactNode;
};

type DataTableVariant = "elevated" | "plain";

const variantShellClass: Record<DataTableVariant, string> = {
  elevated:
    "border border-(--border) bg-(--surface) shadow-elevated",
  plain: "border border-(--border)",
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  variant?: DataTableVariant;
  className?: string;
  rowClassName?: string | ((row: T) => string);
  /** Card-style rows until the table container is wide enough (`@3xl` / 48rem). */
  renderMobileRow?: (row: T, index: number) => ReactNode;
  mobileListClassName?: string;
  /** Optional minimum table width (enables horizontal scroll inside the table shell). */
  tableMinWidth?: string;
};

export const DataTable = <T,>({
  columns,
  data,
  getRowKey,
  variant = "elevated",
  className = "",
  rowClassName,
  renderMobileRow,
  mobileListClassName = "",
  tableMinWidth,
}: DataTableProps<T>) => {
  const hasMobileLayout = Boolean(renderMobileRow);

  return (
    <div className="@container min-w-0">
      {hasMobileLayout && (
        <div
          className={`flex flex-col gap-3 @3xl:hidden ${mobileListClassName}`}
        >
          {data.map((row, index) => (
            <div key={getRowKey(row)}>{renderMobileRow!(row, index)}</div>
          ))}
        </div>
      )}

      <div
        className={`rounded-(--radius-card) ${variantShellClass[variant]} ${
          hasMobileLayout ? "hidden @3xl:block" : ""
        } ${className}`}
      >
        <div className="table-scroll min-w-0 overflow-x-auto overscroll-x-contain">
          <table
            className="w-full table-auto text-sm"
            style={tableMinWidth ? { minWidth: tableMinWidth } : undefined}
          >
            <colgroup>
              {columns.map((column) => (
                <col
                  key={column.id}
                  style={column.width ? { width: column.width } : undefined}
                />
              ))}
            </colgroup>
            <thead className="border-b border-(--border) bg-(--bg)/40 text-(--muted)">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className={`px-3 py-3 font-medium sm:px-5 sm:py-3.5 ${alignClass(
                      column.headerAlign ?? "left",
                    )} ${column.headerClassName ?? ""}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const rowClass =
                  typeof rowClassName === "function"
                    ? rowClassName(row)
                    : rowClassName;

                return (
                  <tr
                    key={getRowKey(row)}
                    className={`border-b border-(--border)/70 transition-colors last:border-0 hover:bg-(--surface-hover)/40 ${rowClass ?? ""}`}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={`px-3 py-3 align-middle sm:px-5 sm:py-4 ${alignClass(
                          column.cellAlign ?? "left",
                        )} ${column.cellClassName ?? ""}`}
                      >
                        {column.render(row, index)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
