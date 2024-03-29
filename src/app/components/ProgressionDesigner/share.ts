import type { Chord, NoteArray } from "@/lib";

export type Progression = {
  name: string;
  chords: ChordItem[];
};

export type ChordItem = {
  id: number;
  chord: Chord;
  omits: NoteArray;
  playing: boolean;
};
