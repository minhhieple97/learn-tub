import { Zap } from 'lucide-react';

type PricingHeaderProps = {
  compact?: boolean;
};

export const PricingHeader = ({ compact = false }: PricingHeaderProps) => {
  if (compact) return null;

  return (
    <div className="mb-16 text-center">
      <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50/50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
        <Zap className="mr-2 size-4" />
        Simple, transparent pricing
      </div>
      <h2 className="mb-6 text-4xl font-bold text-foreground lg:text-5xl">
        Choose Your{' '}
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
          Learning Plan
        </span>
      </h2>
      <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
        Start free and upgrade as you grow. All plans include unlimited note-taking.
      </p>
    </div>
  );
};
