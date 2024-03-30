export enum QualityEnum {
  HalfStep,
  Minor,
  Major,
  Perfect,
  Augmented,
  DoublyAugmented,
  Diminished,
  DoublyDiminished,
}

const abbrToQualityEnumMap: Record<string, QualityEnum> = {
  H: QualityEnum.HalfStep,
  m: QualityEnum.Minor,
  M: QualityEnum.Major,
  P: QualityEnum.Perfect,
  A: QualityEnum.Augmented,
  AA: QualityEnum.DoublyAugmented,
  d: QualityEnum.Diminished,
  dd: QualityEnum.DoublyDiminished,
};

const qualityEnumToAbbr: Record<QualityEnum, string> = {
  [QualityEnum.HalfStep]: "H",
  [QualityEnum.Minor]: "m",
  [QualityEnum.Major]: "M",
  [QualityEnum.Perfect]: "P",
  [QualityEnum.Augmented]: "A",
  [QualityEnum.DoublyAugmented]: "AA",
  [QualityEnum.Diminished]: "d",
  [QualityEnum.DoublyDiminished]: "dd",
};

const qualityEnumToString: Record<QualityEnum, string> = {
  [QualityEnum.HalfStep]: "half step",
  [QualityEnum.Minor]: "minor",
  [QualityEnum.Major]: "major",
  [QualityEnum.Perfect]: "perfect",
  [QualityEnum.Augmented]: "augmented",
  [QualityEnum.DoublyAugmented]: "doubly augmented",
  [QualityEnum.Diminished]: "diminished",
  [QualityEnum.DoublyDiminished]: "doubly diminished",
};

export class Quality {
  private _quality: QualityEnum;

  constructor(quality: QualityEnum) {
    this._quality = quality;
  }

  static fromAbbr(abbr: string) {
    const value = abbrToQualityEnumMap[abbr];

    if (typeof value === "undefined") {
      const keys = Object.keys(abbrToQualityEnumMap);

      throw new Error(
        `unknown abbr "${abbr}" while converting to Quality, supported values: ${keys.join()}`
      );
    }

    return new Quality(value);
  }

  isHalfStep() {
    return this._quality === QualityEnum.HalfStep;
  }

  isMajor() {
    return this._quality === QualityEnum.Major;
  }

  isMinor() {
    return this._quality === QualityEnum.Minor;
  }

  isPerfect() {
    return this._quality === QualityEnum.Perfect;
  }

  isAugmented() {
    return this._quality === QualityEnum.Augmented;
  }

  isDiminished() {
    return this._quality === QualityEnum.Diminished;
  }

  toAbbr() {
    return qualityEnumToAbbr[this._quality];
  }

  toString(flavor?: string) {
    return qualityEnumToString[this._quality];
  }
}