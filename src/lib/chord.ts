import { Note, NoteIsOptions, NoteToNameOptions, Notes } from "./note";
import { NoteArray } from "./note-array";

export enum ChordTypeEnum {
  Triad,
  Seventh,
  // Ninth,
  // Eleventh,
  // Thirteen,
}

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

const degreeSeqToInversionAndRootIndex: Record<string, [number, number]> = {
  "3-3": [0, 0], // C E G
  "3-4": [1, 2], // E G C
  "4-3": [2, 1], // G C E
  "3-3-3": [0, 0], // C E G B
  "3-3-2": [1, 3], // E G B C
  "3-2-3": [2, 2], // G B C E
  "2-3-3": [3, 1], // B C E G
};

export type ChordIsOptions = {
  checkInversion?: boolean;
  nodeIsOptions?: NoteIsOptions;
};

export class Chord {
  private _noteArr: NoteArray;

  private _root: Note;

  private _inversion = 0;

  constructor(notes: Notes) {
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
    const degrees = intervals.map((inter) => inter.degree.valueOf());

    // determine inversion and root index
    const [inversion, rootIndex] =
      degreeSeqToInversionAndRootIndex[degrees.join("-")] || [];

    if (inversion === undefined || rootIndex === undefined) {
      throw new Error(
        `cannot form a chord with these notes: ${this._noteArr.join()}`
      );
    }

    // root note
    const root = dedup.get(rootIndex)!;

    this._root = root;
    this._inversion = inversion;
  }

  private intervals() {
    return this._noteArr.intervals();
  }

  // TODO: fromAbbr
  fromAbbr(abbr: string) {
    //
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

    return new Chord(notes);
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

  toAbbr(opts?: NoteToNameOptions) {
    const first = this._noteArr.get(0)!.name(opts);

    // C
    const root = this._root.name(opts);

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
        `unable to determine the appropriate chord representation for: ${this.join()}`
      );
    }

    // (♭5)(♭9)(♭13)
    const accidentals = [].join("");

    // /G
    let by = "";

    if (root !== first) {
      by = `/${first}`;
    }

    // CmM7/G
    return `${root}${quality}${accidentals}${by}`;
  }

  notes() {
    return this._noteArr;
  }

  noteNames(opts?: NoteToNameOptions) {
    return this._noteArr.names(opts);
  }

  join(separator = " ", opts?: NoteToNameOptions) {
    return this._noteArr.join(separator, opts);
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

    return notesA.valueOf().every((noteA, index) => {
      const noteB = notesB.get(index)!;
      return noteA.is(noteB, opts?.nodeIsOptions);
    });
  }

  clone() {
    return new Chord(this._noteArr.valueOf());
  }
}
