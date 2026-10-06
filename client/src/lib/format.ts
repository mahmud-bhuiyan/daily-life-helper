const BDT = "BDT";

/** Format integer minor units (paisa) as currency display. */
/** Per-unit price in major currency (not minor units). */
export const formatUnitPrice = (unitPrice: number, currency = BDT): string => {
  const symbol = currency === BDT ? "৳" : `${currency} `;
  return `${symbol}${unitPrice.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatMoney = (
  amountMinor: number,
  currency = BDT,
): string => {
  const major = amountMinor / 100;
  const symbol = currency === BDT ? "৳" : `${currency} `;

  return `${symbol}${major.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** Parse user-entered decimal amount to minor units (rounded). */
export const parseMoneyToMinor = (value: string): number | null => {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) return null;

  const major = Number(trimmed);
  if (!Number.isFinite(major) || major <= 0) return null;

  return Math.round(major * 100);
};

/** `datetime-local` input value from ISO string. */
export const toDateTimeLocalValue = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Local datetime input → ISO string for API. */
export const fromDateTimeLocalValue = (value: string): string =>
  new Date(value).toISOString();

export const formatSpentAt = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

/** Date input (`YYYY-MM-DD`) → start of day UTC ISO for filters. */
export const dateInputToFromIso = (date: string): string =>
  new Date(`${date}T00:00:00`).toISOString();

/** Date input → end of day local ISO for filters. */
export const dateInputToToIso = (date: string): string =>
  new Date(`${date}T23:59:59.999`).toISOString();
