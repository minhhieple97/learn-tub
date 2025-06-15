export function StatsDisplay() {
  return (
    <div className="text-neutral-stone-foreground flex items-center justify-center space-x-8">
      <div className="text-center">
        <div className="text-neutral-pearl-foreground text-2xl font-bold">
          10K+
        </div>
        <div className="text-sm">Active Learners</div>
      </div>
      <div className="bg-neutral-stone h-8 w-px"></div>
      <div className="text-center">
        <div className="text-neutral-pearl-foreground text-2xl font-bold">
          50K+
        </div>
        <div className="text-sm">Notes Created</div>
      </div>
      <div className="bg-neutral-stone h-8 w-px"></div>
      <div className="text-center">
        <div className="text-neutral-pearl-foreground text-2xl font-bold">
          95%
        </div>
        <div className="text-sm">Satisfaction</div>
      </div>
    </div>
  );
}
