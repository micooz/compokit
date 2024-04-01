import type { Chord, Mode, NoteArray } from "@/lib";

export type ProgressionVO = {
  name: string;
  chords: ChordItem[];
  arrangement: "horizontal" | "vertical";
};

export type ChordItem = {
  chord: Chord;
  step?: number;
  inversion: number;
  omits: NoteArray;
  octave: 0 | 8 | -8;
  playing: boolean;
  selected: boolean;
  mode?: Mode;
};
