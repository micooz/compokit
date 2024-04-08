import { Mode } from "./mode";
import { Note } from "./note";
import { NoteArray } from "./note-array";
import {
  ChordIsOptions,
  ChordJSON,
  ChordTypeEnum,
  NoteToNameOptions,
  Notes,
  ResolveToOptions,
} from "./types";

const chordQualityMap: Record<string, string> = {
  "m-m": "dim",
  "m-M": "m",
  "M-m": "", // the triad doesn't need an "M"
  "M-M": "aug",

  "m-m-m": "dim7",
  "m-m-M": "m7(♭5)",
  "m-M-m": "m7",
  "m-M-M": "mM7",
  "M-m-m": "7",
  "M-m-M": "maj7",
  "M-M-m": "aug7",
  "M-M-M": "augM7",
};

const degreeSeqToInversionAndTonicIndex: Record<string, [number, number]> = {
  "3-3": [0, 0], // C E G
  "3-4": [1, 2], // E G C
  "4-3": [2, 1], // G C E
  "3-3-3": [0, 0], // C E G B
  "3-3-2": [1, 3], // E G B C
  "3-2-3": [2, 2], // G B C E
  "2-3-3": [3, 1], // B C E G
};

export class Chord {
  private _mode?: Mode;

  private _step?: number;

  private _noteArr: NoteArray;

  private _tonic: Note;

  private _inversion = 0;

  constructor(notes: Notes, mode?: Mode, step?: number) {
    this._mode = mode;
    this._step = step;
    this._noteArr = new NoteArray(notes);

    // TODO: supports structures containing omitted and added notes
    if (this._noteArr.count() < 3) {
      throw new Error("chord must contain at least three note");
    }

    // dedup
    const dedup = this._noteArr.dedup();

    // intervals in pairs
    const intervals = dedup.intervals();

    // extract degrees
    const degrees = intervals.map((inter) => inter.degree().valueOf());

    // determine inversion and tonic index
    const [inversion, tonicIndex] =
      degreeSeqToInversionAndTonicIndex[degrees.join("-")] || [];

    if (inversion === undefined || tonicIndex === undefined) {
      throw new Error(
        `cannot form a chord with these notes: ${this._noteArr.join()}`
      );
    }

    // tonic note
    const tonic = dedup.get(tonicIndex)!;

    this._tonic = tonic;
    this._inversion = inversion;
  }

  private intervals() {
    return this._noteArr.intervals();
  }

  tonic() {
    return this._tonic;
  }

  mode() {
    return this._mode;
  }

  step() {
    return this._step;
  }

  // // TODO: fromAbbr
  // static fromAbbr(abbr: string) {
  //   //
  // }

  static fromJSON(json: ChordJSON) {
    const { notes, mode, step } = json;

    let _mode: Mode | undefined;

    if (mode && mode.type !== undefined) {
      _mode = Mode.from(mode.key, mode.type);
    }

    return new Chord(notes, _mode, step);
  }

  toAbbr(opts?: NoteToNameOptions) {
    const first = this._noteArr.get(0)!.name(opts);

    // C
    const tonic = this._tonic.name(opts);

    // chord in root position
    const inRootPosition = this.inverse(-this._inversion);

    // quality sequence
    const qualitySeq = inRootPosition
      .intervals()
      .map((quality) => {
        if (quality.isMinor()) {
          return "m";
        }
        if (quality.isMajor()) {
          return "M";
        }
        if (quality.isAugmented()) {
          return "aug";
        }
        if (quality.isDiminished()) {
          return "dim";
        }
      })
      .filter(Boolean)
      .join("-");

    // m/M/aug/dim(7/9/11/13)
    const quality = chordQualityMap[qualitySeq];

    if (quality === undefined) {
      throw new Error(
        `unable to determine the appropriate chord representation for: ${this.notes().join()}`
      );
    }

    // (♭5)(♭9)(♭13)
    const accidentals = [].join("");

    // /G
    let by = "";

    if (tonic !== first) {
      by = `/${first}`;
    }

    // CmM7/G
    return `${tonic}${quality}${accidentals}${by}`;
  }

  inverse(ordinal = 1) {
    const backward = ordinal < 0;
    const notes = this._noteArr.clone().valueOf();

    for (let n = 1; n <= Math.abs(ordinal); n += 1) {
      if (backward) {
        const last = notes.pop()!;

        if (last.group) {
          last.group -= 1;
        }

        notes.unshift(last);
      } else {
        const first = notes.shift()!;

        if (first.group) {
          first.group += 1;
        }

        notes.push(first);
      }
    }

    return new Chord(notes, this._mode, this._step);
  }

  inversion() {
    return this._inversion;
  }

  rootPosition() {
    if (this._inversion === 0) {
      return this.clone();
    }
    return this.inverse(-this._inversion);
  }

  notes() {
    return this._noteArr;
  }

  is(chord: Chord, opts?: ChordIsOptions) {
    const { checkInversion, nodeIsOptions } = opts || {};

    const notesA = this.notes();
    const notesB = chord.notes();

    if (notesA.count() !== notesB.count()) {
      return false;
    }
    if (checkInversion && this.inversion() !== chord.inversion()) {
      return false;
    }

    for (const note of notesA.valueOf()) {
      if (!notesB.includes(note, nodeIsOptions)) {
        return false;
      }
    }

    return true;
  }

  resolveTo(opts: ResolveToOptions) {
    const { algorithm } = opts;

    if (algorithm === "closely-related-modes") {
      if (!this._mode) {
        throw new Error("this chord is not associated with a mode");
      }

      const modes = [
        this._mode,
        this._mode.relative(),
        this._mode.relative().dominant(),
        this._mode.relative().subDominant(),
        this._mode.dominant(),
        this._mode.subDominant(),
        this._mode.parallel(),
      ];

      // get all chords
      const chords = modes
        .map((mode) => mode.chords(ChordTypeEnum.Triad))
        .flat();

      const possibles: Chord[] = [];

      // compare each chord
      for (const chord of chords) {
        // skip the same chord
        if (this.is(chord)) {
          continue;
        }

        const tonic = chord.tonic();

        for (const note of this._noteArr.valueOf()) {
          // should resolved to tonic
          if (note.to(tonic).is("m2")) {
            possibles.push(chord);
            break;
          }
        }
      }

      return possibles;
    }

    return [];
  }

  clone() {
    return new Chord(this._noteArr.valueOf(), this._mode, this._step);
  }

  toJSON() {
    const json: ChordJSON = { notes: this._noteArr.names() };

    if (this._mode) {
      json.mode = { key: this._mode.key().name(), type: this._mode.type() };
    }
    if (this._step) {
      json.step = this._step;
    }

    return json;
  }
}
