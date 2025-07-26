'use client';

import { SearchInput } from './search-input';
import { useVideoSearch } from '@/features/videos/hooks/use-video-search';
import { Loader2 } from 'lucide-react';

type VideoSearchSectionProps = {
  className?: string;
};

export const VideoSearchSection = ({ className }: VideoSearchSectionProps) => {
  const { searchQuery, setSearchQuery, clearSearch, isSearching } =
    useVideoSearch();

  return (
    <div className={className}>
      <div className="relative">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={clearSearch}
          placeholder="Search videos by title..."
        />
        {isSearching && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 mt-2">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Searching...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
