"use client";
import React from "react";
import { NoteArray } from "@/lib";
import { NoteItem } from "../NoteItem";

export interface NoteListProps {
  notes: NoteArray;
  className?: string;
}

export function NoteList(props: NoteListProps) {
  const { notes, className } = props;

  return (
    <div className={className}>
      {notes.valueOf().map((note, index, arr) => (
        <React.Fragment key={index}>
          <NoteItem>{note.name({ transformAccidental: true })}</NoteItem>
          {index !== arr.length - 1 && ","}
        </React.Fragment>
      ))}
    </div>
  );
}
