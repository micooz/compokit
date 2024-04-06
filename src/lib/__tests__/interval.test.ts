import { Degree } from "../degree";
import { Interval } from "../interval";
import { Quality, QualityEnum } from "../quality";
import { DegreeEnum } from "../types";

test("Interval::new", () => {
  expect(
    new Interval(
      new Quality(QualityEnum.Major),
      new Degree(DegreeEnum.Third)
    ).toAbbr()
  ).toBe("M3");
});

test("Interval::from", () => {
  expect(Interval.from(Interval.from("M2")).toAbbr()).toBe("M2");
  expect(Interval.from("M2").toAbbr()).toBe("M2");
  expect(Interval.from("P4").toAbbr()).toBe("P4");

  expect(() => Interval.from("m8")).toThrow("only perfect octave(P8) is valid");
  expect(() => Interval.from("P2")).toThrow("only P1/P8/P4/P5 is valid");
  expect(() => Interval.from("M5")).toThrow("M4/M5/m4/m5 is invalid");
});

test("Interval::fromDegreeAndSemitones", () => {
  expect(Interval.fromDegreeAndSemitones(3, 6).toAbbr()).toBe("AA3");
  expect(() => Interval.fromDegreeAndSemitones(3, 7)).toThrow(
    "cannot determine interval from degree = 3 and semitones = 7"
  );
});

test("Interval::fromDegreeAndSemitones", () => {
  expect(Interval.fromDegreeAndSemitones(3, 6).toAbbr()).toBe("AA3");
  expect(() => Interval.fromDegreeAndSemitones(3, 7)).toThrow(
    "cannot determine interval from degree = 3 and semitones = 7"
  );
});

test("Interval::quality", () => {
  expect(Interval.from("M3").quality().valueOf()).toBe(QualityEnum.Major);
});

test("Interval::degree", () => {
  expect(Interval.from("M3").degree().valueOf()).toBe(3);
});

test("Interval::semitones", () => {
  expect(Interval.from("M3").semitones()).toBe(4);
});

test("Interval::is", () => {
  expect(Interval.from("M3").is("M3")).toBe(true);
  expect(Interval.from("M3").is(Interval.from("M3"))).toBe(true);
});

test("Interval::isSemitone", () => {
  expect(Interval.from("S1").isSemitone()).toBe(true);
});

test("Interval::isMajor", () => {
  expect(Interval.from("M2").isMajor()).toBe(true);
});

test("Interval::isMinor", () => {
  expect(Interval.from("m2").isMinor()).toBe(true);
});

test("Interval::isPerfect", () => {
  expect(Interval.from("P1").isPerfect()).toBe(true);
});

test("Interval::isAugmented", () => {
  expect(Interval.from("A3").isAugmented()).toBe(true);
});

test("Interval::isDoublyAugmented", () => {
  expect(Interval.from("AA3").isDoublyAugmented()).toBe(true);
});

test("Interval::isDiminished", () => {
  expect(Interval.from("d3").isDiminished()).toBe(true);
});

test("Interval::isDoublyDiminished", () => {
  expect(Interval.from("dd3").isDoublyDiminished()).toBe(true);
});

test("Interval::toAbbr", () => {
  expect(Interval.from("A3").toAbbr()).toBe("A3");
});
