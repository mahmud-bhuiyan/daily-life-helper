type SkeletonRowsProps = {
  count?: number;
  rowClassName?: string;
};

export const SkeletonRows = ({
  count = 3,
  rowClassName = "h-24 rounded-(--radius-card) bg-(--surface)",
}: SkeletonRowsProps) => (
  <div className="space-y-3" aria-hidden>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`animate-pulse ${rowClassName}`} />
    ))}
  </div>
);
