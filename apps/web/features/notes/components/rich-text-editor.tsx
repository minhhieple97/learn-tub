"use client";

import React from "react";
import { EditorContent } from "@tiptap/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRichTextEditor } from "@/features/notes/hooks/use-rich-text-editor";
import { RICH_TEXT_EDITOR } from "@/features/notes/constants";
import { Toolbar, LoadingState } from "./rich-text-editor/index";

export const RichTextEditor = () => {
  const { editor, disabled } = useRichTextEditor();

  if (!editor) {
    return <LoadingState />;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <Toolbar editor={editor} disabled={disabled} />
      </CardHeader>

      <CardContent className="p-0">
        <EditorContent
          editor={editor}
          className={`min-h-[${RICH_TEXT_EDITOR.MIN_HEIGHT}px] border-t`}
        />
      </CardContent>
    </Card>
  );
};
