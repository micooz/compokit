"use client";
import React from "react";
import { useReactive } from "ahooks";
import classNames from "classnames";

import { TextBeauty } from "@/components/TextBeauty";
import { ee } from "@/utils/ee";
import { Note } from "@/lib/note";

export interface NoteItemProps {
  children: string;
}

export function NoteItem(props: NoteItemProps) {
  const { children: note } = props;

  const state = useReactive({
    highlight: "none" as "light" | "normal" | "dark" | "none",
    showRelatedNotes: true,
  });

  ee.useEvent("SEARCH_NOTE", (keywords) => {
    if (!keywords) {
      state.highlight = "none";
      return;
    }

    const notes = keywords.split(" ").filter(Boolean);

    let match = false;

    for (const item of notes) {
      if (state.showRelatedNotes) {
        const from = Note.from(item);
        const to = Note.from(note);

        if (from.to(to).isSemitone() || to.to(from).isSemitone()) {
          state.highlight = "light";
          match = true;
          // break;
        }
      }

      if (item === note) {
        state.highlight = "normal";
        match = true;
        break;
      }
    }

    if (!match) {
      state.highlight = "none";
    }
  });

  ee.useEvent("TOGGLE_SHOW_RELATED_NOTES", (show) => {
    state.showRelatedNotes = show;
  });

  function onSelect() {
    ee.emit("SELECT_NOTE", note);
  }

  return (
    <div
      className={classNames(
        "relative inline-block px-1 w-[25px] text-center cursor-pointer border border-transparent",
        {
          "hover:border-neutral-200": state.highlight === "none",
          "bg-yellow-100": state.highlight === "light",
          "bg-yellow-300": state.highlight === "normal",
          "bg-yellow-500": state.highlight === "dark",
        }
      )}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onSelect();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <TextBeauty>{note}</TextBeauty>
    </div>
  );
}
