'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotesSearch } from '../hooks';
import { SEARCH_CONFIG } from '@/config/constants';

type NotesSearchProps = {
  placeholder?: string;
  className?: string;
};

export const NotesSearch = ({
  placeholder = 'Search notes content...',
  className = '',
}: NotesSearchProps) => {
  const {
    inputValue,
    isSearching,
    isSearchActive,
    resultCount,
    handleInputChange,
    handleClearSearch,
  } = useNotesSearch();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pl-8 pr-3"
          maxLength={SEARCH_CONFIG.MAX_QUERY_LENGTH}
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:scale-110"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {inputValue && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {isSearching
              ? 'Searching...'
              : isSearchActive && resultCount > 0
              ? `Found ${resultCount} note${resultCount !== 1 ? 's' : ''}`
              : 'No notes found'}
          </span>
          {inputValue && (
            <Badge variant="secondary" className="text-xs">
              "{inputValue}"
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
