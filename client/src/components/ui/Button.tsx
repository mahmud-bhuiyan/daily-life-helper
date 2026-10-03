import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-(--accent) text-(--bg) shadow-[0_1px_2px_rgba(0,0,0,0.3),0_0_20px_rgba(34,197,94,0.15)] hover:bg-(--accent-hover) active:scale-[0.98]",
  ghost:
    "border border-transparent bg-transparent text-(--text) hover:border-(--border) hover:bg-(--surface-hover) active:scale-[0.98]",
  danger:
    "bg-(--danger) text-white shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:opacity-90 active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-sm",
  md: "min-h-11 px-4 py-2.5 text-sm",
};

export const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) => (
  <button
    type="button"
    disabled={disabled}
    className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-(--radius-input) font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/50 focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg) disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
);
