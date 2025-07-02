"use client";

import { NoteEditorForm } from "./note-editor-form";
import { NotesListWithSearch } from "./notes-list-with-search";

export const NoteEditor = () => {
  return (
    <div className="w-full space-y-6">
      <NoteEditorForm />
      <NotesListWithSearch />
    </div>
  );
};
