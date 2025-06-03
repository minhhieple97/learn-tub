'use client';

import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import type { TagsSectionProps } from '../types';

export function TagsSection({
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onKeyDown,
}: TagsSectionProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <X className="h-3 w-3 cursor-pointer" onClick={() => onRemoveTag(tag)} />
          </Badge>
        ))}
      </div>
      <div className="flex space-x-2">
        <Input
          placeholder="Add tags..."
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1"
        />
        <Button variant="outline" size="icon" onClick={onAddTag}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
