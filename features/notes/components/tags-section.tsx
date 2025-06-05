'use client';

import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import type { TagsSectionProps } from '../types';
import { VALIDATION_LIMITS } from '@/config/constants';

export const TagsSection = ({
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onKeyDown,
}: TagsSectionProps) => {
  return (
    <div className="space-y-3">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onRemoveTag(tag)} />
            </Badge>
          ))}
        </div>
      )}
      <div className="space-y-2">
        <div className="flex space-x-2">
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => onTagInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full"
            />
          </div>
          <Button variant="outline" size="icon" onClick={onAddTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="text-xs text-gray-500">
            Tags: {tags.length}/{VALIDATION_LIMITS.MAX_TAGS_COUNT}
          </div>
        )}
      </div>
    </div>
  );
};
