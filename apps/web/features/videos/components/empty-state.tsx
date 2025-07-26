"use client";

import { Search } from "lucide-react";

type EmptyStateProps = {
  searchQuery?: string;
  title?: string;
  description?: string;
};

export const EmptyState = ({
  searchQuery,
  title = "No Videos Found",
  description,
}: EmptyStateProps) => {
  const getDescription = () => {
    if (description) return description;
    if (searchQuery) {
      return `Your search for "${searchQuery}" did not return any results.`;
    }
    return "No videos available at the moment.";
  };

  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        {getDescription()}
      </p>
      {searchQuery && (
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
          Try adjusting your search terms or browse all videos.
        </p>
      )}
    </div>
  );
};
