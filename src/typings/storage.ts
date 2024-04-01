import { ModeEnum } from "@/lib";

export type Progression = {
  name: string;
  chords: {
    chord: string[];
    step?: number;
    inversion: number;
    omits: string[];
    octave: 0 | 8 | -8;
    mode?: { key: string; type: ModeEnum };
  }[];
  arrangement: "horizontal" | "vertical";
};
