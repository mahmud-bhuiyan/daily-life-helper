type IconProps = {
  className?: string;
};

export const MailIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8.25l8.954 5.568a1.5 1.5 0 001.092 0L22 8.25M4.5 19h15a1.5 1.5 0 001.5-1.5V6.75A1.5 1.5 0 0019.5 5.25h-15A1.5 1.5 0 003 6.75v10.5A1.5 1.5 0 004.5 19z"
    />
  </svg>
);

export const LockIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-1.125 0h10.125A1.125 1.125 0 0120.625 11.625v7.125A1.125 1.125 0 0119.5 19.875H5.625a1.125 1.125 0 01-1.125-1.125V11.625A1.125 1.125 0 015.625 10.5H6.75z"
    />
  </svg>
);

export const EyeIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1 1 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export const EyeOffIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c1.841 0 3.577-.437 5.103-1.213M9.878 9.878a3 3 0 104.243 4.243M6.228 6.228L17.772 17.772"
    />
  </svg>
);
