import type { ReactNode } from 'react';

type CardVariant = 'default' | 'highlight' | 'glass';

type CardProps = {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  variant?: CardVariant;
  padding?: 'default' | 'none';
};

const variantClasses: Record<CardVariant, string> = {
  default: 'border-(--border) bg-(--surface)',
  highlight:
    'border-(--accent)/20 bg-linear-to-br from-(--accent)/10 via-(--surface) to-(--surface) shadow-accent-soft',
  glass: 'border-(--border)/80 bg-(--surface)/90 backdrop-blur-xl',
};

export const Card = ({
  children,
  className = '',
  header,
  variant = 'default',
  padding = 'default',
}: CardProps) => (
  <div
    className={`overflow-hidden rounded-(--radius-card) border shadow-elevated ${variantClasses[variant]} ${className}`}
  >
    {header && <div className="border-b border-(--border) px-5 py-4">{header}</div>}
    <div className={padding === 'default' ? 'p-5 sm:p-6' : ''}>{children}</div>
  </div>
);
