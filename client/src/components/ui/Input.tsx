import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
};

export const Input = ({
  label,
  error,
  hint,
  leadingIcon,
  trailing,
  className = "",
  id,
  ...props
}: InputProps) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-(--text)">
          {label}
        </label>
      )}

      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-(--muted)">
            {leadingIcon}
          </span>
        )}

        <input
          id={inputId}
          className={`min-h-11 w-full rounded-(--radius-input) border border-(--border) bg-(--bg)/80 py-2.5 text-sm text-(--text) placeholder:text-(--muted) outline-none transition-colors focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 ${leadingIcon ? "pl-10" : "pl-4"} ${trailing ? "pr-11" : "pr-4"} ${error ? "border-(--danger) focus:border-(--danger) focus:ring-(--danger)/20" : ""} ${className}`}
          {...props}
        />

        {trailing && (
          <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
            {trailing}
          </div>
        )}
      </div>

      {hint && !error && <p className="text-xs text-(--muted)">{hint}</p>}
      {error && <p className="text-xs text-(--danger)">{error}</p>}
    </div>
  );
};
