import { useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon, LockIcon } from "./icons";
import { Input } from "./Input";

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const PasswordInput = ({
  label,
  error,
  hint,
  ...props
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      label={label}
      error={error}
      hint={hint}
      type={visible ? "text" : "password"}
      leadingIcon={<LockIcon />}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="flex min-h-9 min-w-9 items-center justify-center rounded-(--radius-input) text-(--muted) transition-colors hover:bg-(--surface-hover) hover:text-(--text)"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
};
