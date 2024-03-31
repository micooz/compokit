import { ModeEnum } from "@/lib";

export type ProgressionItem = {
  name: string;
  chords: {
    chord: string[];
    inversion: number;
    omits: string[];
    octave: 0 | 8 | -8;
    mode?: { key: string; type: ModeEnum };
  }[];
};
