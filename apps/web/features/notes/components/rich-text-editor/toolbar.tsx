"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { Separator } from "@/components/ui/separator";
import { FormattingButtons } from "./formatting-buttons";
import { MediaButtons } from "./media-buttons";

type IToolbarProps = {
  editor: Editor;
  disabled: boolean;
};

export const Toolbar = ({ editor, disabled }: IToolbarProps) => {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <FormattingButtons editor={editor} disabled={disabled} />

      <Separator orientation="vertical" className="mx-2 h-6" />

      <MediaButtons />
    </div>
  );
};
