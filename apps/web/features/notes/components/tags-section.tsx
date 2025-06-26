"use client";

import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import type { ITagsSectionProps } from "../types";
import { VALIDATION_LIMITS } from "@/config/constants";
import { useNotesStore } from "../store";

export const TagsSection = ({
  onAddTag,
  onRemoveTag,
  onKeyDown,
  onTagInputChange,
}: ITagsSectionProps) => {
  const { formTags, tagInput } = useNotesStore();
  return (
    <div className="space-y-4">
      {formTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {formTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
            >
              {tag}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                onClick={() => onRemoveTag(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
      <div className="space-y-3">
        <div className="flex space-x-3">
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => onTagInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onAddTag}
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formTags.length > 0 && (
          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700">
            Tags: {formTags.length}/{VALIDATION_LIMITS.MAX_TAGS_COUNT}
          </div>
        )}
      </div>
    </div>
  );
};
