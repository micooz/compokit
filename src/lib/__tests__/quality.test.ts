import { Quality, QualityEnum } from "../quality";

test("Quality::new", () => {
  expect(new Quality(QualityEnum.Major).toString()).toBe("major");
});

test("Quality::fromAbbr", () => {
  expect(() => Quality.fromAbbr("xx")).toThrow(
    'unknown abbr "xx" while converting to Quality, supported values: H,m,M,P,A,AA,d,dd'
  );

  expect(Quality.fromAbbr("dd").toString()).toBe("doubly diminished");
});

test("Quality::isSemitone", () => {
  expect(Quality.fromAbbr("H").isSemitone()).toBe(true);
  expect(Quality.fromAbbr("M").isSemitone()).toBe(false);
});

test("Quality::isMajor", () => {
  expect(Quality.fromAbbr("M").isMajor()).toBe(true);
  expect(Quality.fromAbbr("m").isMajor()).toBe(false);
});

test("Quality::isMinor", () => {
  expect(Quality.fromAbbr("m").isMinor()).toBe(true);
  expect(Quality.fromAbbr("M").isMinor()).toBe(false);
});

test("Quality::isPerfect", () => {
  expect(Quality.fromAbbr("P").isPerfect()).toBe(true);
  expect(Quality.fromAbbr("M").isPerfect()).toBe(false);
});

test("Quality::isAugmented", () => {
  expect(Quality.fromAbbr("A").isAugmented()).toBe(true);
  expect(Quality.fromAbbr("AA").isAugmented()).toBe(false);
});

test("Quality::isDiminished", () => {
  expect(Quality.fromAbbr("d").isDiminished()).toBe(true);
  expect(Quality.fromAbbr("dd").isDiminished()).toBe(false);
});

test("Quality::toAbbr", () => {
  expect(Quality.fromAbbr("d").toAbbr()).toBe("d");
});
