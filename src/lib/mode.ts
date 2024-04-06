import { Chord } from "./chord";
import { range, transformObject } from "./utils";
import { Interval } from "./interval";
import { Note } from "./note";
import { NoteArray } from "./note-array";
import {
  AccidentalEnum,
  ChordTypeEnum,
  Inter,
  ModeEnum,
  ModeNameOptions,
  NoteType,
  Notes,
} from "./types";

const majorMinorRelations: Record<number, ModeEnum> = {
  [ModeEnum.NaturalMajor]: ModeEnum.NaturalMinor,
  [ModeEnum.HarmonicMajor]: ModeEnum.HarmonicMinor,
  [ModeEnum.MelodicMajor]: ModeEnum.MelodicMinor,
  [ModeEnum.NaturalMinor]: ModeEnum.NaturalMajor,
  [ModeEnum.HarmonicMinor]: ModeEnum.HarmonicMajor,
  [ModeEnum.MelodicMinor]: ModeEnum.MelodicMajor,
};

const modeGroups: Record<string, Partial<Record<ModeEnum, string>>> = {
  "Major and Minor": {
    [ModeEnum.NaturalMajor]: "Natural Major",
    [ModeEnum.HarmonicMajor]: "Harmonic Major",
    [ModeEnum.MelodicMajor]: "Melodic Major",
    [ModeEnum.NaturalMinor]: "Natural Minor",
    [ModeEnum.HarmonicMinor]: "Harmonic Minor",
    [ModeEnum.MelodicMinor]: "Melodic Minor",
  },
  "Church Mode": {
    [ModeEnum.Ionian]: "Ionian", // same as ModeEnum.NaturalMajor
    [ModeEnum.Dorian]: "Dorian",
    [ModeEnum.Phrygian]: "Phrygian",
    [ModeEnum.Lydian]: "Lydian",
    [ModeEnum.Mixolydian]: "Mixolydian",
    [ModeEnum.Aeolian]: "Aeolian", // same as ModeEnum.NaturalMinor
    [ModeEnum.Locrian]: "Locrian",
  },
  Jazz: {
    // [ModeEnum.MajorBlues]: "Major Blues",
    // [ModeEnum.MinorBlues]: "Minor Blues",
    [ModeEnum.JazzMelodicMinor]: "Melodic Minor (Jazz)",
    [ModeEnum.JazzHarmonicMinor]: "Harmonic Minor (Jazz)",
    // [ModeEnum.Bebop]: "Bebop",
    // [ModeEnum.Diminished]: "Diminished",
  },
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
    // major and minor
    [ModeEnum.NaturalMajor]: ["P1", "M2", "M3", "P4", "P5", "M6", "M7"],
    [ModeEnum.HarmonicMajor]: ["P1", "M2", "M3", "P4", "P5", "m6", "M7"],
    [ModeEnum.MelodicMajor]: ["P1", "M2", "M3", "P4", "P5", "m6", "m7"],
    [ModeEnum.NaturalMinor]: ["P1", "M2", "m3", "P4", "P5", "m6", "m7"],
    [ModeEnum.HarmonicMinor]: ["P1", "M2", "m3", "P4", "P5", "m6", "M7"],
    [ModeEnum.MelodicMinor]: ["P1", "M2", "m3", "P4", "P5", "M6", "M7"],
    // church mode
    [ModeEnum.Ionian]: ["P1", "M2", "M3", "P4", "P5", "M6", "M7"], // same as ModeEnum.NaturalMajor
    [ModeEnum.Dorian]: ["P1", "M2", "m3", "P4", "P5", "M6", "m7"],
    [ModeEnum.Phrygian]: ["P1", "m2", "m3", "P4", "P5", "m6", "m7"],
    [ModeEnum.Lydian]: ["P1", "M2", "M3", "A4", "P5", "M6", "M7"],
    [ModeEnum.Mixolydian]: ["P1", "M2", "M3", "P4", "P5", "M6", "m7"],
    [ModeEnum.Aeolian]: ["P1", "M2", "m3", "P4", "P5", "m6", "m7"], // same as ModeEnum.NaturalMinor
    [ModeEnum.Locrian]: ["P1", "m2", "m3", "P4", "d5", "m6", "m7"],
    // jazz
    [ModeEnum.MajorBlues]: ["P1", "M2", "m3", "M3", "P5", "M6"],
    [ModeEnum.MinorBlues]: ["P1", "m3", "P4", "d5", "P5", "m7"],
    [ModeEnum.JazzMelodicMinor]: ["P1", "M2", "m3", "P4", "P5", "M6", "M7"],
    [ModeEnum.JazzHarmonicMinor]: ["P1", "M2", "m3", "P4", "P5", "m6", "M7"],
    [ModeEnum.Bebop]: ["P1", "M2", "M3", "P4", "P5", "M6", "m7", "M7"],
    [ModeEnum.Diminished]: ["P1", "M2", "m3", "P4", "d5", "m6", "M6", "M7"],
  },
  (_, abbrs) => abbrs.map((abbr) => Interval.from(abbr))
);

export class Mode {
  private _noteArr: NoteArray;

  private _mode?: ModeEnum;

  constructor(notes: Notes, mode?: ModeEnum) {
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
    return Object.entries(modeGroups).map(([group, map]) => ({
      group,
      items: Object.entries(map).map(([key, value]) => ({
        label: value,
        value: Number(key) as ModeEnum,
      })),
    }));
  }

  static getKeys(mode: ModeEnum) {
    const allKeys = range("C", "B", "both").reduce<Note[]>(
      (acc, next) => acc.concat(next.valueOf()),
      []
    );

    // exclude double flat and double sharp key
    // exclude all flat and all sharp key
    const filteredKeys = allKeys.filter((key) => {
      const notes = Mode.from(key, mode).notes().valueOf();

      let count = 0;

      for (const note of notes) {
        if (note.isDoubleFlat() || note.isDoubleSharp()) {
          return false;
        }
        if (!note.isNature()) {
          count += 1;
        }
      }

      if (count === notes.length) {
        return false;
      }

      return true;
    });

    return NoteArray.from(filteredKeys);
  }

  key() {
    return this._noteArr.get(0)!;
  }

  type() {
    return this._mode;
  }

  chord(step: number, type: ChordTypeEnum) {
    const count = this._noteArr.count();

    if (step < 1 || step > count) {
      throw new Error(`step must be between 1 and ${count}, but got: ${step}`);
    }

    const indexes = chordTypeEnumToIndexes[type];

    if (!indexes) {
      throw new Error(`unknown chord type: ${type}`);
    }

    const notes = indexes.map((index) => {
      const idxAbs = step + index - 1;

      let idx = idxAbs % count;
      idx = idx < 1 ? idx + count : idx;

      const note = this._noteArr.get(idx - 1)!;

      if (note.group) {
        note.group += Math.floor((idxAbs - 1) / count);
      }

      return note;
    });

    return new Chord(notes, this.clone(), step);
  }

  chords(type: ChordTypeEnum) {
    const to = this.notes().count();

    const chords: Chord[] = [];

    for (let step = 1; step <= to; step += 1) {
      const chord = this.chord(step, type);
      chords.push(chord);
    }

    return chords;
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

  dominant() {
    return Mode.from(this._noteArr.get(4)!, this._mode!);
  }

  subDominant() {
    return Mode.from(this._noteArr.get(3)!, this._mode!);
  }

  name(opts?: ModeNameOptions) {
    const root = this._noteArr.root().name(opts);

    let mode = "";

    if (this._mode === undefined) {
      mode = "Unknown Mode";
    } else {
      const map = Object.values(modeGroups).reduce((acc, next) => {
        return { ...acc, ...next };
      }, {});

      mode = map[this._mode]!;
    }

    if (opts?.shortName) {
      mode = mode
        .replace("Natural ", "")
        .replace("Harmonic ", "")
        .replace("Melodic ", "");
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
