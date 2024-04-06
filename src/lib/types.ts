import type { Note } from "./note";
import type { NoteArray } from "./note-array";

export enum ModeEnum {
  // major and minor
  NaturalMajor,
  HarmonicMajor,
  MelodicMajor,
  NaturalMinor,
  HarmonicMinor,
  MelodicMinor,
  // church mode
  Ionian,
  Dorian,
  Phrygian,
  Lydian,
  Mixolydian,
  Aeolian,
  Locrian,
  // jazz
  MajorBlues,
  MinorBlues,
  JazzMelodicMinor,
  JazzHarmonicMinor,
  Bebop,
  Diminished,
}

export type ModeNameOptions = { shortName?: boolean } & NoteToNameOptions;

export type ResolveToOptions = {
  algorithm: "closely-related-modes";
};

export enum ChordTypeEnum {
  Triad,
  Seventh,
  // Ninth,
  // Eleventh,
  // Thirteen,
}

export type ChordIsOptions = {
  checkInversion?: boolean;
  nodeIsOptions?: NoteIsOptions;
};

export type ChordJSON = {
  notes: string[];
  mode?: { key: string; type?: ModeEnum };
  step?: number;
};

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

export type NoteToNameOptions = {
  transformAccidental?: boolean;
};

export type NoteIsOptions = {
  checkGroup?: boolean;
  checkAccidental?: boolean;
};

export type NoteType = string | Note;

export type Notes = string[] | Note[] | NoteArray;
