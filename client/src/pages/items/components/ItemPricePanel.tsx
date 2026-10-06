import { useMemo } from "react";
import { ChartShell, ItemPriceChart } from "../../../components/charts";
import { Card, EmptyState, Input } from "../../../components/ui";
import { useItemPriceHistory } from "../../../hooks";
import {
  dateInputToFromIso,
  dateInputToToIso,
  formatUnitPrice,
} from "../../../lib/format";
import type { Item, ItemPriceHistoryParams } from "../../../types";

type ItemPricePanelProps = {
  item: Item | undefined;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
};

export const ItemPricePanel = ({
  item,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: ItemPricePanelProps) => {
  const range: ItemPriceHistoryParams | null = useMemo(() => {
    if (!fromDate || !toDate) return null;
    return {
      from: dateInputToFromIso(fromDate),
      to: dateInputToToIso(toDate),
    };
  }, [fromDate, toDate]);

  const { data, isPending, isError, error, refetch } = useItemPriceHistory(
    item?.id,
    range ?? undefined,
  );

  const loading = Boolean(item && range && isPending && !data);
  const points = data?.points ?? [];

  if (!item) {
    return (
      <Card>
        <EmptyState
          title="Select an item"
          description="Pick a product from the list to see how its unit price changed over time."
        />
      </Card>
    );
  }

  const latestPrice = points.length > 0 ? points[points.length - 1].unitPrice : null;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <Card variant="highlight" className="flex flex-wrap items-end gap-4">
        <div>
          <h2 className="text-lg font-medium text-(--text)">{item.name}</h2>
          {item.unit && (
            <p className="mt-0.5 text-sm text-(--muted)">Unit: {item.unit}</p>
          )}
          {latestPrice !== null && (
            <p className="mt-2 text-sm text-(--muted)">
              Latest unit price:{" "}
              <span className="font-medium text-(--accent)">
                {formatUnitPrice(latestPrice)}
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Input
            type="date"
            label="From"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
          />
          <Input
            type="date"
            label="To"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
          />
        </div>
      </Card>

      {isError && !data ? (
        <div className="rounded-(--radius-card) border border-(--danger)/40 bg-(--danger)/10 px-4 py-3 text-sm text-(--text)">
          {error instanceof Error ? error.message : "Failed to load price history"}
          <button
            type="button"
            className="ml-3 text-(--accent) underline"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      ) : (
        <ChartShell
          title="Unit price over time"
          subtitle="From expenses linked to this item (quantity or unit price required)"
          loading={loading}
          empty={!loading && points.length === 0}
          emptyMessage="No priced purchases for this item in the selected range. Add an expense with quantity or unit price."
        >
          {data && points.length > 0 && <ItemPriceChart points={points} />}
        </ChartShell>
      )}
    </div>
  );
};
