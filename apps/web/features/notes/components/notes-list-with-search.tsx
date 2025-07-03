"use client";

import React from "react";
import { NotesList } from "./notes-list";
import { NotesSearch } from "./notes-search";

type NotesListWithSearchProps = {
  showSearch?: boolean;
  searchPlaceholder?: string;
};

export const NotesListWithSearch = ({
  showSearch = true,
  searchPlaceholder = "Search notes content...",
}: NotesListWithSearchProps) => {
  return (
    <div className="space-y-4">
      {showSearch && <NotesSearch placeholder={searchPlaceholder} />}

      <NotesList />
    </div>
  );
};
