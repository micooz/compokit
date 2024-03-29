import { Degree } from "./degree";
import { Quality } from "./quality";

const halfStepCountMap: Record<string, number> = {
  P1: 0,
  H1: 1, // special case: only one half step

  m2: 1,
  M2: 2,
  A2: 3,

  d3: 2,
  m3: 3,
  M3: 4,
  A3: 5,

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

  d6: 7,
  m6: 8,
  M6: 9,
  A6: 10,

  d7: 9,
  m7: 10,
  M7: 11,
  A7: 12,

  P8: 12,
};

// '1_0': 'P1',
// '2_1': 'm2',
const degreeHalfStepCountToAbbr = Object.entries(halfStepCountMap).reduce(
  (acc, [key, value]) => {
    const newKey = `${key.slice(-1)}_${value}`;
    acc[newKey] = key;
    return acc;
  },
  {} as Record<string, string>
);

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
    const degree = Degree.fromNumber(n);

    if (n === 1 && !quality.isPerfect() && !quality.isHalfStep()) {
      throw new Error("only perfect unison(P1) or half step(H1) is valid");
    }
    if (n === 8 && !quality.isPerfect()) {
      throw new Error("only perfect octave(P8) is valid");
    }
    if (n === 2 && quality.isDiminished()) {
      throw new Error("diminished second(d2) is invalid");
    }
    if (n === 4 || n === 5) {
      if (quality.isMajor() || quality.isMinor()) {
        throw new Error("M4/M5/m4/m5 is invalid");
      }
    }

    return new Interval(quality, degree);
  }

  static fromDegreeAndHalfStepCount(degree: number, halfStepCount: number) {
    if (halfStepCount === 0) {
      return Interval.from("P1");
    }

    const key = `${degree}_${halfStepCount}`;
    const abbr = degreeHalfStepCountToAbbr[key];

    if (!abbr) {
      throw new Error(
        `cannot determine interval from degree = ${degree} and halfStepCount = ${halfStepCount}`
      );
    }

    return Interval.from(abbr);
  }

  get quality() {
    return this._quality;
  }

  get degree() {
    return this._degree;
  }

  get halfStepCount() {
    return halfStepCountMap[this.toAbbr()]!;
  }

  is(source: Inter) {
    if (typeof source === "string") {
      return source === this.toAbbr();
    }
    return source.toAbbr() === this.toAbbr();
  }

  isHalfStep() {
    const count = this.halfStepCount;
    return count === 1 || count === 11;
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

  isDiminished() {
    return this._quality.isDiminished();
  }

  toAbbr() {
    return `${this._quality.toAbbr()}${this._degree.valueOf()}`;
  }

  toString() {
    return `${this._quality.toString()} ${this._degree.toString()}`;
  }
}

export type Inter = string | Interval;
