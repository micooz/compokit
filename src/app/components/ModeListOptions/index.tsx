"use client";
import React from "react";
import classNames from "classnames";
import { useMount, useReactive } from "ahooks";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { Skeleton } from "primereact/skeleton";

import { ee } from "@/utils/ee";
import { storage } from "@/utils/storage";

export interface ModeListOptionsProps {
  className?: string;
}

export function ModeListOptions(props: ModeListOptionsProps) {
  const { className } = props;

  const state = useReactive({
    showRelatedNotes: false,
    searchNote: "",
    loaded: false,
  });

  useMount(() => {
    state.showRelatedNotes = storage.showRelatedNotes || false;
    state.loaded = true;
  });

  function refresh() {
    if (!state.searchNote) {
      return;
    }
    setTimeout(() => {
      ee.emit("SEARCH_NOTE", state.searchNote.trim());
    });
  }

  function onToggleRelatedNotes(e: CheckboxChangeEvent) {
    const checked = e.checked ?? false;
    state.showRelatedNotes = checked;
    storage.showRelatedNotes = checked;

    ee.emit("TOGGLE_SHOW_RELATED_NOTES", checked);
    refresh();
  }

  function onSearchNote(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value
      .replace(/#/g, "♯")
      .replace(/##/g, "𝄪")
      .replace(/b/g, "♭")
      .replace(/bb/g, "𝄫");

    state.searchNote = text;
    ee.emit("SEARCH_NOTE", text.trim());
  }

  function onClearSearch() {
    state.searchNote = "";
    ee.emit("SEARCH_NOTE", "");
  }

  ee.useEvent("SELECT_NOTE", (note) => {
    let notes = state.searchNote.split(" ");

    if (notes.includes(note)) {
      notes = notes.filter((item) => item !== note);
    } else {
      notes.push(note);
    }

    const keywords = notes.join(" ");

    state.searchNote = keywords;
    ee.emit("SEARCH_NOTE", keywords);
  });

  if (!state.loaded) {
    return (
      <React.Fragment>
        <Skeleton width="100%" height="37px" />
      </React.Fragment>
    );
  }

  return (
    <div className={classNames("flex flex-wrap gap-4 py-2", className)}>
      <div className="flex items-center">
        <Checkbox
          inputId="showRelatedNotes"
          onChange={onToggleRelatedNotes}
          checked={state.showRelatedNotes}
        />
        <label
          htmlFor="showRelatedNotes"
          className="text-xs ml-2 whitespace-nowrap"
        >
          Show Related Notes
        </label>
      </div>

      <div className="p-input-icon-left max-sm:w-full">
        <i className="pi pi-search" />
        <InputText
          id="search-note-input"
          value={state.searchNote}
          onChange={onSearchNote}
          placeholder="Search note..."
          className="p-inputtext-sm w-full"
          style={{ paddingRight: state.searchNote ? 16 : "auto" }}
        />
        {state.searchNote && (
          <i
            className="pi pi-times cursor-pointer -ml-6"
            onClick={onClearSearch}
          />
        )}
      </div>
    </div>
  );
}