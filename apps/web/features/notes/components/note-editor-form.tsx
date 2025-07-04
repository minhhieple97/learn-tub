"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimestampDisplay } from "./timestamp-display";
import { TagsSection } from "./tags-section";
import { NoteFormActions } from "./note-form-actions";
import { RichTextEditor } from "./rich-text-editor";
import { useRichTextEditor } from "../hooks";
import { VALIDATION_LIMITS } from "@/config/constants";
import { useNotesStore } from "../store";

export const NoteEditorForm = () => {
  const { currentTimestamp } = useNotesStore();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Take Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TimestampDisplay timestamp={currentTimestamp} clickable={false} />

        <div className="space-y-2">
          <RichTextEditor />
        </div>

        <TagsSection />

        <NoteFormActions />
      </CardContent>
    </Card>
  );
};
