import type { Chord } from "@/lib";

export type EventName =
  | "TOGGLE_SHOW_RELATED_NOTES"
  | "SEARCH_NOTE"
  | "SELECT_NOTE"
  | "SELECT_CHORD"
  | "INSERT_CHORD"
  | "ADD_CHORD";

export type EventArgs = {
  TOGGLE_SHOW_RELATED_NOTES: boolean;
  SEARCH_NOTE: string;
  SELECT_NOTE: string;
  SELECT_CHORD: Chord | undefined;
  INSERT_CHORD: boolean;
  ADD_CHORD: Chord;
};
