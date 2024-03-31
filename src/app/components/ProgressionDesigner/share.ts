import type { Chord, Mode, NoteArray } from "@/lib";

export type Progression = {
  name: string;
  chords: ChordItem[];
};

export type ChordItem = {
  chord: Chord;
  step?: number;
  inversion: number;
  omits: NoteArray;
  octave: 0 | 8 | -8;
  playing: boolean;
  replacing: boolean;
  mode?: Mode;
};
