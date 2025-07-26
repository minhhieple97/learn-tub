'use client';

import React from 'react';
import { Sidebar } from '@/components/shared/sidebar';
import { ClientHeader } from '@/components/shared/client-header';
import { usePomodoroStore } from '@/features/pomodoro/store';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { focusModeEnabled } = usePomodoroStore();

  return (
    <div
      className={cn(
        'flex h-screen transition-all duration-500 ease-in-out',
        focusModeEnabled
          ? 'bg-neutral-pearl dark:bg-neutral-pearl'
          : 'bg-slate-50 dark:bg-slate-900',
      )}
    >
      {/* Sidebar - Width 0 in focus mode but still rendered */}
      <div
        className={cn(
          'transition-all duration-500 ease-in-out overflow-hidden flex-shrink-0',
          focusModeEnabled ? 'w-0' : 'w-auto',
        )}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-col flex-1 overflow-hidden transition-all duration-500 ease-in-out',
          focusModeEnabled && 'focus-workspace',
        )}
      >
        {/* Header - Dimmed in focus mode */}
        <div className={cn('transition-all duration-300', focusModeEnabled && 'focus-mode-dimmed')}>
          <ClientHeader />
        </div>

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 overflow-auto transition-all duration-300',
            focusModeEnabled ? 'p-2' : 'p-4',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
