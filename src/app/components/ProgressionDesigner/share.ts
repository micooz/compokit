import type { Chord, NoteArray } from "@/lib";

export type ProgressionVO = {
  name: string;
  chords: ChordItem[];
  arrangement: "horizontal" | "vertical";
  insertIndex: number;
};

export type ChordItem = {
  chord: Chord;
  inversion: number;
  omits: NoteArray;
  octave: 0 | 8 | -8;
  playing: boolean;
  selected: boolean;
};
