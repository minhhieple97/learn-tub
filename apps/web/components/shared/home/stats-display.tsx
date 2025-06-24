export const StatsDisplay = () => {
  return (
    <div className="flex items-center justify-center space-x-8 text-slate-600 dark:text-slate-400">
      <div className="text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-indigo-400">
          10K+
        </div>
        <div className="text-sm">Active Learners</div>
      </div>
      <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
      <div className="text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-indigo-400">
          50K+
        </div>
        <div className="text-sm">Notes Created</div>
      </div>
      <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
      <div className="text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-indigo-400">
          95%
        </div>
        <div className="text-sm">Satisfaction</div>
      </div>
    </div>
  );
};
