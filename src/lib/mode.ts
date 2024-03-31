import { Chord, ChordTypeEnum } from "./chord";
import { transformObject } from "./common";
import { Inter, Interval } from "./interval";
import {
  AccidentalEnum,
  Note,
  NoteToNameOptions,
  NoteType,
  Notes,
} from "./note";
import { NoteArray } from "./note-array";

export enum ModeEnum {
  NaturalMajor,
  HarmonicMajor,
  MelodicMajor,

  NaturalMinor,
  HarmonicMinor,
  MelodicMinor,

  Ionian,
  Dorian,
  Phrygian,
  Lydian,
  Mixolydian,
  Aeolian,
  Locrian,
}

const majorKeys = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F",
  "B♭",
  "E♭",
  "A♭",
  "D♭",
  "G♭",
];

const minorKeys = [
  "A",
  "E",
  "B",
  "F♯",
  "C♯",
  "G♯",
  "D",
  "G",
  "C",
  "F",
  "B♭",
  "D♯",
];

const modeEnumToKeys: Record<ModeEnum, string[]> = {
  [ModeEnum.NaturalMajor]: majorKeys,
  [ModeEnum.HarmonicMajor]: majorKeys,
  [ModeEnum.MelodicMajor]: majorKeys,

  [ModeEnum.NaturalMinor]: minorKeys,
  [ModeEnum.HarmonicMinor]: minorKeys,
  [ModeEnum.MelodicMinor]: minorKeys,

  // TODO:
  [ModeEnum.Ionian]: majorKeys,
  [ModeEnum.Dorian]: [],
  [ModeEnum.Phrygian]: [],
  [ModeEnum.Lydian]: [],
  [ModeEnum.Mixolydian]: [],
  [ModeEnum.Aeolian]: minorKeys,
  [ModeEnum.Locrian]: [],
};

const majorMinorRelations: Record<number, ModeEnum> = {
  [ModeEnum.NaturalMajor]: ModeEnum.NaturalMinor,
  [ModeEnum.HarmonicMajor]: ModeEnum.HarmonicMinor,
  [ModeEnum.MelodicMajor]: ModeEnum.MelodicMinor,

  [ModeEnum.NaturalMinor]: ModeEnum.NaturalMajor,
  [ModeEnum.HarmonicMinor]: ModeEnum.HarmonicMajor,
  [ModeEnum.MelodicMinor]: ModeEnum.MelodicMajor,
};

const modeEnumToString: Record<ModeEnum, string> = {
  [ModeEnum.NaturalMajor]: "Natural Major",
  [ModeEnum.HarmonicMajor]: "Harmonic Major",
  [ModeEnum.MelodicMajor]: "Melodic Major",

  [ModeEnum.NaturalMinor]: "Natural Minor",
  [ModeEnum.HarmonicMinor]: "Harmonic Minor",
  [ModeEnum.MelodicMinor]: "Melodic Minor",

  [ModeEnum.Ionian]: "Ionian", // same as ModeEnum.NaturalMajor
  [ModeEnum.Dorian]: "Dorian",
  [ModeEnum.Phrygian]: "Phrygian",
  [ModeEnum.Lydian]: "Lydian",
  [ModeEnum.Mixolydian]: "Mixolydian",
  [ModeEnum.Aeolian]: "Aeolian", // same as ModeEnum.NaturalMinor
  [ModeEnum.Locrian]: "Locrian",
};

const chordTypeEnumToIndexes: Record<ChordTypeEnum, number[]> = {
  [ChordTypeEnum.Triad]: [1, 3, 5],
  [ChordTypeEnum.Seventh]: [1, 3, 5, 7],
  // [ChordTypeEnum.Ninth]: [1, 3, 5, 7, 9],
  // [ChordTypeEnum.Eleventh]: [1, 3, 5, 7, 9, 11],
  // [ChordTypeEnum.Thirteen]: [1, 3, 5, 7, 9, 11, 13],
};

const modeToIntervals = transformObject(
  {
    [ModeEnum.NaturalMajor]: ["P1", "M2", "M3", "P4", "P5", "M6", "M7"],
    [ModeEnum.HarmonicMajor]: ["P1", "M2", "M3", "P4", "P5", "m6", "M7"],
    [ModeEnum.MelodicMajor]: ["P1", "M2", "M3", "P4", "P5", "m6", "m7"],

    [ModeEnum.NaturalMinor]: ["P1", "M2", "m3", "P4", "P5", "m6", "m7"],
    [ModeEnum.HarmonicMinor]: ["P1", "M2", "m3", "P4", "P5", "m6", "M7"],
    [ModeEnum.MelodicMinor]: ["P1", "M2", "m3", "P4", "P5", "M6", "M7"],

    [ModeEnum.Ionian]: ["P1", "M2", "M3", "P4", "P5", "M6", "M7"], // same as ModeEnum.NaturalMajor
    [ModeEnum.Dorian]: ["P1", "M2", "m3", "P4", "P5", "M6", "m7"],
    [ModeEnum.Phrygian]: ["P1", "m2", "m3", "P4", "P5", "m6", "m7"],
    [ModeEnum.Lydian]: ["P1", "M2", "M3", "A4", "P5", "M6", "M7"],
    [ModeEnum.Mixolydian]: ["P1", "M2", "M3", "P4", "P5", "M6", "m7"],
    [ModeEnum.Aeolian]: ["P1", "M2", "m3", "P4", "P5", "m6", "m7"], // same as ModeEnum.NaturalMinor
    [ModeEnum.Locrian]: ["P1", "m2", "m3", "P4", "d5", "m6", "m7"],
  },
  (_, abbrs) => abbrs.map((abbr) => Interval.from(abbr))
);

type ModeNameOptions = { shortName?: boolean } & NoteToNameOptions;

export class Mode {
  private _noteArr: NoteArray;

  private _mode?: ModeEnum;

  constructor(notes: Notes | NoteArray, mode?: ModeEnum) {
    this._noteArr = Array.isArray(notes) ? new NoteArray(notes) : notes;

    if (this._noteArr.count() === 0) {
      throw new Error("mode must contains at least one note");
    }

    this._mode = mode;
  }

  static from(key: NoteType, mode: ModeEnum) {
    const intervals = modeToIntervals[mode];

    if (!intervals) {
      throw new Error(`unknown mode: ${mode}`);
    }

    const root = typeof key === "string" ? Note.from(key) : key;
    const notes = intervals.map((inter) => root.add(inter));

    // In harmonic minor, force set 7th note(which accidental is AccidentalEnum.Natural) to AccidentalEnum.NaturalWithSymbol.
    if (
      mode === ModeEnum.HarmonicMinor &&
      notes[6].accidental === AccidentalEnum.Natural
    ) {
      notes[6].accidental = AccidentalEnum.NaturalWithSymbol;
    }

    return new Mode(notes, mode);
  }

  static modes() {
    return Object.entries(modeEnumToString).map(([key, value]) => ({
      label: value,
      value: Number(key) as ModeEnum,
    }));
  }

  static getKeys(mode: ModeEnum) {
    const keys = modeEnumToKeys[mode];

    if (!keys) {
      throw new Error(`unsupported mode: ${mode}`);
    }

    return keys;
  }

  key() {
    return this._noteArr.get(0)!;
  }

  type() {
    return this._mode;
  }

  chord(step: number, type?: ChordTypeEnum) {
    if (step < 1 || step > 7) {
      throw new Error("step must be between 1 and 7");
    }

    const indexes = chordTypeEnumToIndexes[type || ChordTypeEnum.Triad];

    if (!indexes) {
      throw new Error(`unknown chord type: ${type}`);
    }

    const notes = indexes.map((index) => {
      const idxAbs = step + index - 1;

      let idx = idxAbs % 7;
      idx = idx < 1 ? idx + 7 : idx;

      const note = this._noteArr.get(idx - 1)!;

      if (note.group) {
        note.group += Math.floor((idxAbs - 1) / 7);
      }

      return note;
    });

    return new Chord(notes);
  }

  transpose(direction: "low" | "high", inter: Inter) {
    if (direction === "low") {
      this._noteArr = this._noteArr.map((note) => note.minus(inter));
    }
    if (direction === "high") {
      this._noteArr = this._noteArr.map((note) => note.add(inter));
    }

    return this;
  }

  parallel() {
    if (!this.isMajor() && !this.isMinor()) {
      throw new Error("parallel() only works on major or minor mode");
    }

    const root = this._noteArr.root();
    const mode = majorMinorRelations[this._mode!];

    return Mode.from(root, mode);
  }

  relative() {
    if (!this.isMajor() && !this.isMinor()) {
      throw new Error("relative() only works on major or minor mode");
    }

    let root = this._noteArr.root();

    if (this.isMajor()) {
      root = root.minus("m3");
    }
    if (this.isMinor()) {
      root = root.add("m3");
    }

    const mode = majorMinorRelations[this._mode!];

    return Mode.from(root, mode);
  }

  name(opts?: ModeNameOptions) {
    const root = this._noteArr.root().name(opts);

    let mode =
      typeof this._mode === "undefined"
        ? "Unknown Mode"
        : modeEnumToString[this._mode];

    if (opts?.shortName) {
      mode = mode
        .replace("Natural", "")
        .replace("Harmonic", "")
        .replace("Melodic", "");
    }

    return `${root} ${mode}`;
  }

  notes() {
    return this._noteArr;
  }

  clone() {
    return new Mode(this._noteArr.clone(), this._mode);
  }

  private isMajor() {
    return (
      typeof this._mode !== "undefined" &&
      [
        ModeEnum.NaturalMajor,
        ModeEnum.HarmonicMajor,
        ModeEnum.MelodicMajor,
      ].includes(this._mode)
    );
  }

  private isMinor() {
    return (
      typeof this._mode !== "undefined" &&
      [
        ModeEnum.NaturalMinor,
        ModeEnum.HarmonicMinor,
        ModeEnum.MelodicMinor,
      ].includes(this._mode)
    );
  }
}
