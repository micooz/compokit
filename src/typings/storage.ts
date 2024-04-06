import { ChordJSON, ModeEnum } from "@/lib";

export type Progression = {
  name: string;
  chords: {
    chord: ChordJSON;
    inversion: number;
    omits: string[];
    octave: 0 | 8 | -8;

    /**
     * @deprecated
     */
    step?: number;

    /**
     * @deprecated
     */
    mode?: { key: string; type: ModeEnum };
  }[];
  arrangement: "horizontal" | "vertical";
};
