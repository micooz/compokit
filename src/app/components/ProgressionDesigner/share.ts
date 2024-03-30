import type { Chord, NoteArray } from "@/lib";

export type Progression = {
  name: string;
  chords: ChordItem[];
};

export type ChordItem = {
  chord: Chord;
  inversion: number;
  omits: NoteArray;
  octave: 0 | 8 | -8;
  playing: boolean;
  replacing: boolean;
};