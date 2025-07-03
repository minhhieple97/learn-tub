"use client";

import React from "react";
import { EditorContent, Editor } from "@tiptap/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RICH_TEXT_EDITOR } from "@/features/notes/constants";
import { Toolbar, LoadingState } from "./rich-text-editor/index";

type IRichTextEditorProps = {
  editor: Editor | null;
  disabled?: boolean;
};

export const RichTextEditor = ({
  editor,
  disabled = false,
}: IRichTextEditorProps) => {
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
