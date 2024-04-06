import { Degree } from "../degree";
import { DegreeEnum } from "../types";

test("Degree::new", () => {
  expect(new Degree(DegreeEnum.Unison).valueOf()).toBe(DegreeEnum.Unison);
});

test("Degree::fromNumber", () => {
  expect(Degree.from(3).valueOf()).toBe(DegreeEnum.Third);

  expect(() => Degree.from(NaN).valueOf()).toThrow(
    "invalid number: NaN, must provide an integer."
  );
  expect(() => Degree.from(0).valueOf()).toThrow(
    "invalid degree: 0, must between 1 and 8."
  );
});

test("Degree::valueOf", () => {
  expect(Degree.from(3).valueOf()).toBe(DegreeEnum.Third);
});
