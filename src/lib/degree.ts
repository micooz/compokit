import { DegreeEnum } from "./types";

export class Degree {
  private _degree: DegreeEnum;

  constructor(degree: DegreeEnum) {
    this._degree = degree;
  }

  static from(num: number | string) {
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
    return this._degree;
  }
}
