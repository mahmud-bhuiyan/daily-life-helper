import type { SelectHTMLAttributes } from "react";
import { FieldLabel } from "./FieldLabel";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = ({
  label,
  error,
  className = "",
  id,
  children,
  required,
  ...props
}: SelectProps) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <FieldLabel htmlFor={selectId} required={required}>
          {label}
        </FieldLabel>
      )}
      <select
        id={selectId}
        required={required}
        className={`min-h-11 w-full cursor-pointer rounded-(--radius-input) border border-(--border) bg-(--bg)/80 px-4 py-2.5 text-sm text-(--text) outline-none transition-colors focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 ${error ? "border-(--danger)" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-(--danger)">{error}</p>}
    </div>
  );
};
