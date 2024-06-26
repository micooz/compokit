import { Interval } from "./interval";
import {
  AccidentalEnum,
  Inter,
  NoteEnum,
  NoteIsOptions,
  NoteToNameOptions,
  NoteType,
} from "./types";

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

  isDoubleSharp() {
    return this._accidental === AccidentalEnum.DoubleSharp;
  }

  isFlat() {
    return this._accidental === AccidentalEnum.Flat;
  }

  isDoubleFlat() {
    return this._accidental === AccidentalEnum.DoubleFlat;
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
    const { checkGroup = false, checkAccidental = true } = opts || {};

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

    if (interval.is("S1")) {
      throw new Error("unsupported interval: S1");
    }

    if (interval.is("P1")) {
      return this.clone();
    }

    const degree = interval.degree().valueOf();
    const nextNoteAbs = this._note.valueOf() + degree - 1;

    // move to the same octave
    const nextNote = Note.fromIndex(nextNoteAbs);

    // across how many octaves
    nextNote.group =
      this._group === undefined
        ? this._group
        : this._group + Math.floor((nextNoteAbs - 1) / 7);

    // decide next note's accidental
    const diff = interval.semitones() - this.to(nextNote).semitones();

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

    if (interval.is("S1")) {
      throw new Error("unsupported interval: S1");
    }

    if (interval.is("P1")) {
      return this.clone();
    }

    const degree = interval.degree().valueOf();
    const nextNoteAbs = this._note.valueOf() - degree + 1;

    // move to the same octave
    const nextNote = Note.fromIndex(nextNoteAbs);

    // across how many octaves
    nextNote.group =
      this._group === undefined
        ? this._group
        : this._group + Math.floor((nextNoteAbs - 1) / 7);

    // decide next note's accidental
    const diff = interval.semitones() - nextNote.to(this).semitones();

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

    // 2. calculate semitone count
    let semitones = degree * 2 - 2;

    let from = this.index;

    // in white keys
    while (from !== note.index) {
      const note = Note.fromIndex(from + 1);

      if (note.is("F") || note.is("C")) {
        semitones -= 1;
      }

      from = note.index;
    }

    // consider current note's accidental
    semitones -= accidentalOffsetMap[this._accidental];

    // consider target note's accidental
    semitones += accidentalOffsetMap[note.accidental];

    // in case C# to C is -1, G# to Gb is -2
    semitones = Math.abs(semitones);

    return Interval.fromDegreeAndSemitones(degree, semitones);
  }
}
