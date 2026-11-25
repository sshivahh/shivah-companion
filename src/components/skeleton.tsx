export function Skeleton() {
  return (
    <div className="animate-pulse space-y-6 pt-3">
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-rule" />
        <div className="h-9 w-52 rounded-lg bg-rule" />
      </div>
      <div className="h-16 rounded-2xl bg-surface" />
      <div className="h-40 rounded-2xl bg-surface" />
    </div>
  );
}
