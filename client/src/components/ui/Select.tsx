import type { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = ({ label, error, className = '', id, children, ...props }: SelectProps) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-(--text)">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`min-h-11 w-full cursor-pointer rounded-(--radius-input) border border-(--border) bg-(--bg)/80 px-4 py-2.5 text-sm text-(--text) outline-none transition-colors focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 ${error ? 'border-(--danger)' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-(--danger)">{error}</p>}
    </div>
  );
};
