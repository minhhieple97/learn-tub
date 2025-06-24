import React from "react";

type HeaderContainerProps = {
  children: React.ReactNode;
};

export function HeaderContainer({ children }: HeaderContainerProps) {
  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 px-6 py-4">
      <div className="flex items-center justify-between container mx-auto">
        {children}
      </div>
    </header>
  );
}
