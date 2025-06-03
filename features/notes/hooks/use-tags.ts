'use client';

import { useState, useCallback } from 'react';
import type { UseTagsReturn } from '../types';

export const useTags = (): UseTagsReturn => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const resetTags = useCallback(() => {
    setTags([]);
    setTagInput('');
  }, []);

  return {
    tags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    setTags,
    resetTags,
  };
};
