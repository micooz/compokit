import { Degree } from "./degree";
import { Quality } from "./quality";
import { Inter } from "./types";

const intervalToSemitonesMap: Record<string, number> = {
  S1: 1, // only one semitone
  d1: 2,
  P1: 0,

  d2: 0,
  m2: 1,
  M2: 2,
  A2: 3,
  AA2: 4,

  dd3: 1,
  d3: 2,
  m3: 3,
  M3: 4,
  A3: 5,
  AA3: 6,

  dd4: 3,
  d4: 4,
  P4: 5,
  A4: 6,
  AA4: 7,

  dd5: 5,
  d5: 6,
  P5: 7,
  A5: 8,
  AA5: 9,

  dd6: 6,
  d6: 7,
  m6: 8,
  M6: 9,
  A6: 10,
  AA6: 11,

  dd7: 8,
  d7: 9,
  m7: 10,
  M7: 11,
  A7: 12,
  AA7: 13,

  P8: 12,
};

// '1_0': 'P1',
// '2_1': 'm2',
const degreeSemitonesCountToAbbr = Object.entries(
  intervalToSemitonesMap
).reduce((acc, [key, value]) => {
  const newKey = `${key.slice(-1)}_${value}`;
  acc[newKey] = key;
  return acc;
}, {} as Record<string, string>);

export class Interval {
  private _quality: Quality;

  private _degree: Degree;

  constructor(quality: Quality, degree: Degree) {
    this._quality = quality;
    this._degree = degree;
  }

  static from(source: Inter) {
    if (source instanceof Interval) {
      return source;
    }

    const prefix = source.substring(0, source.length - 1);
    const num = source[source.length - 1];

    const quality = Quality.fromAbbr(prefix);

    const n = Number(num);
    const degree = Degree.from(n);

    if (n === 8 && !quality.isPerfect()) {
      throw new Error("only perfect octave(P8) is valid");
    }
    if (quality.isPerfect() && ![1, 4, 5, 8].includes(n)) {
      throw new Error("only P1/P8/P4/P5 is valid");
    }
    if (n === 4 || n === 5) {
      if (quality.isMajor() || quality.isMinor()) {
        throw new Error("M4/M5/m4/m5 is invalid");
      }
    }

    return new Interval(quality, degree);
  }

  static fromDegreeAndSemitones(degree: number, semitones: number) {
    const key = `${degree}_${semitones}`;
    const abbr = degreeSemitonesCountToAbbr[key];

    if (!abbr) {
      throw new Error(
        `cannot determine interval from degree = ${degree} and semitones = ${semitones}`
      );
    }

    return Interval.from(abbr);
  }

  quality() {
    return this._quality;
  }

  degree() {
    return this._degree;
  }

  semitones() {
    return intervalToSemitonesMap[this.toAbbr()]!;
  }

  is(source: Inter) {
    if (typeof source === "string") {
      return source === this.toAbbr();
    }
    return source.toAbbr() === this.toAbbr();
  }

  isSemitone() {
    return this.semitones() === 1;
  }

  isMajor() {
    return this._quality.isMajor();
  }

  isMinor() {
    return this._quality.isMinor();
  }

  isPerfect() {
    return this._quality.isPerfect();
  }

  isAugmented() {
    return this._quality.isAugmented();
  }

  isDoublyAugmented() {
    return this._quality.isDoublyAugmented();
  }

  isDiminished() {
    return this._quality.isDiminished();
  }

  isDoublyDiminished() {
    return this._quality.isDoublyDiminished();
  }

  toAbbr() {
    return `${this._quality.toAbbr()}${this._degree.valueOf()}`;
  }
}
