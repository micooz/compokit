import { dedupBy } from "./common";
import { Inter, Interval } from "./interval";

export enum NoteEnum {
  C = 1,
  D,
  E,
  F,
  G,
  A,
  B,
}

export enum AccidentalEnum {
  Natural,
  NaturalWithSymbol,
  Sharp,
  Flat,
  DoubleSharp,
  DoubleFlat,
}

const abbrToNoteEnum: Record<string, NoteEnum> = {
  C: NoteEnum.C,
  D: NoteEnum.D,
  E: NoteEnum.E,
  F: NoteEnum.F,
  G: NoteEnum.G,
  A: NoteEnum.A,
  B: NoteEnum.B,
};

const abbrToAccidentalEnum: Record<string, AccidentalEnum> = {
  "": AccidentalEnum.Natural,
  "#": AccidentalEnum.Sharp,
  "##": AccidentalEnum.DoubleSharp,
  b: AccidentalEnum.Flat,
  bb: AccidentalEnum.DoubleFlat,

  "♮": AccidentalEnum.NaturalWithSymbol,
  "♯": AccidentalEnum.Sharp,
  "𝄪": AccidentalEnum.DoubleSharp,
  "♭": AccidentalEnum.Flat,
  "𝄫": AccidentalEnum.DoubleFlat,
};

const noteEnumToString: Record<NoteEnum, string> = {
  [NoteEnum.C]: "C",
  [NoteEnum.D]: "D",
  [NoteEnum.E]: "E",
  [NoteEnum.F]: "F",
  [NoteEnum.G]: "G",
  [NoteEnum.A]: "A",
  [NoteEnum.B]: "B",
};

const accidentalEnumToString: Record<AccidentalEnum, string> = {
  [AccidentalEnum.Natural]: "",
  [AccidentalEnum.NaturalWithSymbol]: "♮",
  [AccidentalEnum.Sharp]: "♯",
  [AccidentalEnum.Flat]: "♭",
  [AccidentalEnum.DoubleSharp]: "𝄪",
  [AccidentalEnum.DoubleFlat]: "𝄫",
};

const accidentalEnumToHumanString: Record<AccidentalEnum, string> = {
  [AccidentalEnum.Natural]: "",
  [AccidentalEnum.NaturalWithSymbol]: "",
  [AccidentalEnum.Sharp]: "#",
  [AccidentalEnum.Flat]: "b",
  [AccidentalEnum.DoubleSharp]: "##",
  [AccidentalEnum.DoubleFlat]: "bb",
};

const accidentalOffsetMap = {
  [AccidentalEnum.Natural]: 0,
  [AccidentalEnum.NaturalWithSymbol]: 0,
  [AccidentalEnum.Sharp]: 1,
  [AccidentalEnum.Flat]: -1,
  [AccidentalEnum.DoubleSharp]: 2,
  [AccidentalEnum.DoubleFlat]: -2,
};

const noteNames = Object.keys(abbrToNoteEnum);
const noteAbbrRegex = new RegExp(
  `^([${noteNames.join("")}])([^\\d]{0,})(\\d{0,})$`,
  "i"
);

export type NoteToNameOptions = {
  transformAccidental?: boolean;
};

export type NoteIsOptions = {
  checkGroup?: boolean;
  checkAccidental?: boolean;
};

export class Note {
  /**
   * C、D、E、F、G、A、B
   */
  private _note: NoteEnum;

  /**
   * 0-9
   * Default: 0
   */
  private _group?: number;

  /**
   * Default: AccidentalEnum.Natural
   */
  private _accidental: AccidentalEnum;

  constructor(note: NoteEnum, group?: number, accidental?: AccidentalEnum) {
    this._note = note;
    this._group = group;
    this._accidental = accidental ?? AccidentalEnum.Natural;
  }

  static from(src: NoteType) {
    if (src instanceof Note) {
      return src.clone();
    }

    const abbr = src;

    const matches = abbr.match(noteAbbrRegex);

    if (!matches) {
      throw new Error(`invalid abbr: ${abbr}`);
    }

    let [_, _note, _acc, _group] = matches;

    const note = abbrToNoteEnum[_note.toUpperCase()];

    // if (typeof note === "undefined") {
    //   throw new Error(`unknown note: ${_note}`);
    // }

    const accidental = abbrToAccidentalEnum[_acc];

    if (typeof accidental === "undefined") {
      throw new Error(`invalid accidental: ${_acc}`);
    }

    const group = _group === "" ? undefined : Number(_group);

    if (group && (group < 0 || group > 9)) {
      throw new Error(`invalid group: ${group}`);
    }

    return new Note(note, group, accidental);
  }

  static fromIndex(index: number) {
    if (index >= NoteEnum.C && index <= NoteEnum.B) {
      return new Note(index);
    }

    let final = index % 7;

    if (final <= 0) {
      final += 7;
    }

    return new Note(final);
  }

  get index() {
    return this._note;
  }

  get accidental() {
    return this._accidental;
  }

  set accidental(value: AccidentalEnum) {
    this._accidental = value;
  }

  get group() {
    return this._group;
  }

  set group(value: number | undefined) {
    this._group = value;
  }

  isNature() {
    return (
      this._accidental === AccidentalEnum.Natural ||
      this._accidental === AccidentalEnum.NaturalWithSymbol
    );
  }

  isSharp() {
    return this._accidental === AccidentalEnum.Sharp;
  }

  isFlat() {
    return this._accidental === AccidentalEnum.Flat;
  }

  clone() {
    return new Note(this._note, this._group, this._accidental);
  }

  name(opts?: NoteToNameOptions) {
    const { transformAccidental = false } = opts || {};

    const note = noteEnumToString[this._note];
    const accidental = transformAccidental
      ? accidentalEnumToString[this._accidental]
      : accidentalEnumToHumanString[this._accidental];

    return `${note}${accidental}`;
  }

  nameWithGroup(opts?: NoteToNameOptions) {
    let name = this.name(opts);

    if (typeof this._group !== "undefined") {
      name += this._group;
    }

    return name;
  }

  is(note: NoteType, opts?: NoteIsOptions) {
    const { checkGroup = false, checkAccidental = false } = opts || {};

    const _note = Note.from(note);
    const conditions: boolean[] = [];

    conditions.push(this.index === _note.index);

    if (checkGroup && (this.group !== undefined || _note.group !== undefined)) {
      conditions.push(this.group === _note.group);
    }
    if (checkAccidental && (!this.isNature() || !_note.isNature())) {
      conditions.push(this.accidental === _note.accidental);
    }

    return conditions.every((item) => item);
  }

  add(inter: Inter) {
    const interval = Interval.from(inter);

    if (interval.is("H1")) {
      throw new Error("unsupported interval: H1");
    }

    if (interval.is("P1")) {
      return this.clone();
    }

    const degree = interval.degree.valueOf();
    const nextNoteAbs = this._note.valueOf() + degree - 1;

    // move to the same octave
    const nextNote = Note.fromIndex(nextNoteAbs);

    // across how many octaves
    nextNote.group =
      this._group === undefined
        ? this._group
        : this._group + Math.floor((nextNoteAbs - 1) / 7);

    // decide next note's accidental
    const diff = interval.halfStepCount - this.to(nextNote).halfStepCount;

    const accidental = {
      [-2]: AccidentalEnum.DoubleFlat,
      [-1]: AccidentalEnum.Flat,
      [0]: AccidentalEnum.Natural,
      [12]: AccidentalEnum.Natural,
      [1]: AccidentalEnum.Sharp,
      [2]: AccidentalEnum.DoubleSharp,
    }[diff];

    nextNote.accidental = accidental!;

    return nextNote;
  }

  minus(inter: Inter) {
    const interval = Interval.from(inter);

    if (interval.is("H1")) {
      throw new Error("unsupported interval: H1");
    }

    if (interval.is("P1")) {
      return this.clone();
    }

    const degree = interval.degree.valueOf();
    const nextNoteAbs = this._note.valueOf() - degree + 1;

    // move to the same octave
    const nextNote = Note.fromIndex(nextNoteAbs);

    // across how many octaves
    nextNote.group =
      this._group === undefined
        ? this._group
        : this._group + Math.floor((nextNoteAbs - 1) / 7);

    // decide next note's accidental
    const diff = interval.halfStepCount - nextNote.to(this).halfStepCount;

    const accidental = {
      [2]: AccidentalEnum.DoubleFlat,
      [1]: AccidentalEnum.Flat,
      [0]: AccidentalEnum.Natural,
      [12]: AccidentalEnum.Natural,
      [-1]: AccidentalEnum.Sharp,
      [-2]: AccidentalEnum.DoubleSharp,
    }[diff];

    nextNote.accidental = accidental!;

    return nextNote;
  }

  to(note: Note) {
    // 1. calculate degree number
    let degree = note.index - this.index + 1;

    if (degree < 1) {
      degree += 7;
    }

    // 2. calculate half step count
    let halfStepCount = degree * 2 - 2;

    let from = this.index;

    // in white keys
    while (from !== note.index) {
      const note = Note.fromIndex(from + 1);

      if (note.is("F") || note.is("C")) {
        halfStepCount -= 1;
      }

      from = note.index;
    }

    // consider current note's accidental
    halfStepCount -= accidentalOffsetMap[this._accidental];

    // consider target note's accidental
    halfStepCount += accidentalOffsetMap[note.accidental];

    // in case C# to C is -1
    if (halfStepCount === -1) {
      halfStepCount = 1;
    }

    return Interval.fromDegreeAndHalfStepCount(degree, halfStepCount);
  }
}

export class MidiNote extends Note {
  /**
   * 0-127
   */
  private _velocity?: number;
}

export class NoteArray {
  private _notes: Note[] = [];

  constructor(notes: Notes) {
    if (notes.length === 0) {
      this._notes = [];
    }
    if (typeof notes[0] === "string") {
      this._notes = (notes as string[]).map((note) => Note.from(note));
    }
    if (notes[0] instanceof Note) {
      this._notes = (notes as Note[]).map((note) => note.clone());
    }
  }

  static from(notes: Notes) {
    return new NoteArray(notes);
  }

  valueOf() {
    return this._notes;
  }

  count() {
    return this._notes.length;
  }

  get(index: number) {
    return this._notes[index].clone();
  }

  root() {
    return this._notes[0].clone();
  }

  /**
   * calculate intervals in pairs
   */
  intervals() {
    const intervals: Interval[] = [];

    this.forPair((prev, next) => {
      const inter = prev.to(next);
      intervals.push(inter);
    });

    return intervals;
  }

  map(func: (note: Note, index: number, array: Note[]) => Note) {
    const notes = this._notes.map(func);
    return new NoteArray(notes);
  }

  dedup() {
    const notes = dedupBy(this._notes, (note) => note.name());
    return new NoteArray(notes);
  }

  forPair(func: (prev: Note, next: Note) => void) {
    return this._notes.reduce((prev, next) => {
      func(prev, next);
      return next;
    });
  }

  clone() {
    return new NoteArray(this._notes.map((note) => note.clone()));
  }

  join(separator = " ", opts?: NoteToNameOptions) {
    return this.names(opts).join(separator);
  }

  names(opts?: NoteToNameOptions) {
    return this._notes.map((note) =>
      note.nameWithGroup({ transformAccidental: true, ...opts })
    );
  }

  withGroup(from: number) {
    let group = from;

    const notes = this._notes.map((note, index) => {
      const currentNote = note.clone();
      const prevNote = this._notes[index - 1];

      if (prevNote && currentNote.index < prevNote.index) {
        group += 1;
      }

      currentNote.group = group;

      return currentNote;
    });

    return new NoteArray(notes);
  }

  include(note: Note, opts?: NoteIsOptions) {
    for (const item of this._notes) {
      if (note.is(item, opts)) {
        return true;
      }
    }
    return false;
  }

  omit(notes: NoteArray, opts?: NoteIsOptions) {
    const newNotes = this._notes.filter((item) => !notes.include(item));
    return NoteArray.from(newNotes);
  }
}

export type NoteType = string | Note;

export type Notes = string[] | Note[];
