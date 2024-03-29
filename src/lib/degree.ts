export enum DegreeEnum {
  Unison = 1,
  Second,
  Third,
  Fourth,
  Fifth,
  Sixth,
  Seventh,
  Octave,
}

const degreeEnumToString: Record<DegreeEnum, string> = {
  [DegreeEnum.Unison]: "unison",
  [DegreeEnum.Second]: "2nd",
  [DegreeEnum.Third]: "3rd",
  [DegreeEnum.Fourth]: "4th",
  [DegreeEnum.Fifth]: "5th",
  [DegreeEnum.Sixth]: "6th",
  [DegreeEnum.Seventh]: "7th",
  [DegreeEnum.Octave]: "octave",
};

export class Degree {
  private _degree: DegreeEnum;

  constructor(degree: DegreeEnum) {
    this._degree = degree;
  }

  static fromNumber(num: number | string) {
    const n = Number(num);

    if (!Number.isInteger(n)) {
      throw new Error(`invalid number: ${num}, must provide an integer.`);
    }

    if (n < 1 || n > 8) {
      throw new Error(`invalid degree: ${num}, must between 1 and 8.`);
    }

    return new Degree(n);
  }

  valueOf() {
    return this._degree.valueOf();
  }

  toString() {
    return degreeEnumToString[this._degree];
  }
}
