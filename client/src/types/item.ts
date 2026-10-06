export type PriceHistoryPoint = {
  spentAt: string;
  unitPrice: number;
  quantity: number | null;
};

export type ItemPriceHistory = {
  itemId: string;
  points: PriceHistoryPoint[];
};

export type ItemPriceHistoryParams = {
  from: string;
  to: string;
};
