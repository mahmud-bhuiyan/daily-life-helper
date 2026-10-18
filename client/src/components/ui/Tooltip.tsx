import type { ReactNode } from "react";

type TooltipProps = {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
};

const sideClasses = {
  top: "bottom-full mb-1.5",
  bottom: "top-full mt-1.5",
} as const;

/** Hover/focus tooltip for icon buttons. Wraps control so disabled buttons still show hints. */
export const Tooltip = ({
  label,
  children,
  side = "bottom",
}: TooltipProps) => (
  <span className="group/tooltip relative inline-flex">
    {children}
    <span
      role="tooltip"
      className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-(--radius-input) bg-(--surface-hover) px-2.5 py-1.5 text-xs font-medium text-(--text) opacity-0 shadow-elevated ring-1 ring-(--border) transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 ${sideClasses[side]}`}
    >
      {label}
    </span>
  </span>
);
