import { Chord, Mode } from "@/lib";

export type EventName =
  | "TOGGLE_SHOW_RELATED_NOTES"
  | "SEARCH_NOTE"
  | "SELECT_NOTE"
  | "ADD_CHORD";

export type EventArgs = {
  TOGGLE_SHOW_RELATED_NOTES: boolean;
  SEARCH_NOTE: string;
  SELECT_NOTE: string;
  ADD_CHORD: { chord: Chord; mode: Mode };
};
