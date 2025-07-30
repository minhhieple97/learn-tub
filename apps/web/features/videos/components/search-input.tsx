"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { forwardRef } from "react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = "Search...", className }, ref) => {
    return (
      <div className="max-w-md mx-auto relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
          <Input
            ref={ref}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "pl-10 pr-10 py-2 h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0",
              "shadow-sm hover:shadow transition-shadow duration-200",
              className,
            )}
          />
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 h-8 w-8 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={onClear}
            >
              <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
