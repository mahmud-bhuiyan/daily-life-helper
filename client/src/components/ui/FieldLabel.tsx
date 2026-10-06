import type { ReactNode } from "react";

type FieldLabelProps = {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
};

export const FieldLabel = ({ htmlFor, required, children }: FieldLabelProps) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-(--text)">
    {children}
    {required && <span className="text-(--danger)" aria-hidden="true"> *</span>}
  </label>
);
