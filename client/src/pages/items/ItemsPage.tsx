import { useState } from "react";
import { PageHeader } from "../../components/layout";
import { Card, EmptyState, Input } from "../../components/ui";
import { useItems } from "../../hooks";
import { defaultPriceHistoryRange } from "../../lib/reportRange";
import type { Item } from "../../types";
import { ItemPricePanel } from "./components/ItemPricePanel";

const isoToDateInput = (iso: string) => iso.slice(0, 10);

export const ItemsPage = () => {
  const defaultRange = defaultPriceHistoryRange();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [fromDate, setFromDate] = useState(() => isoToDateInput(defaultRange.from));
  const [toDate, setToDate] = useState(() => isoToDateInput(defaultRange.to));

  const { data: items = [], isPending, isError, error, refetch } = useItems(
    search.trim() || undefined,
  );

  const selected =
    items.find((item) => item.id === selectedId) ?? items[0];
  const activeId = selected?.id;

  const listLoading = isPending && items.length === 0;

  return (
    <>
      <PageHeader
        title="Items"
        description="Track product prices from your expenses — search, select, and compare over time."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <Card
          header={<h2 className="text-sm font-medium text-(--text)">Products</h2>}
          className="min-w-0"
        >
          <Input
            label="Search"
            placeholder="e.g. onion"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {isError && !items.length ? (
            <div className="mt-4 text-sm text-(--text)">
              {error instanceof Error ? error.message : "Failed to load items"}
              <button
                type="button"
                className="ml-2 text-(--accent) underline"
                onClick={() => refetch()}
              >
                Retry
              </button>
            </div>
          ) : listLoading ? (
            <ul className="mt-4 space-y-2" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <li
                  key={i}
                  className="h-10 animate-pulse rounded-(--radius-input) bg-(--surface-hover)"
                />
              ))}
            </ul>
          ) : items.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No items yet"
                description="Create items when adding expenses, or search with a different term."
              />
            </div>
          ) : (
            <ul className="mt-4 max-h-96 space-y-1 overflow-y-auto">
              {items.map((item: Item) => {
                const active = item.id === activeId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`flex w-full items-center justify-between rounded-(--radius-input) px-3 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? "bg-(--accent)/15 text-(--text)"
                          : "text-(--muted) hover:bg-(--surface-hover) hover:text-(--text)"
                      }`}
                    >
                      <span className="font-medium">{item.name}</span>
                      {item.unit && (
                        <span className="text-xs text-(--muted)">{item.unit}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <ItemPricePanel
          item={selected}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />
      </div>
    </>
  );
};
