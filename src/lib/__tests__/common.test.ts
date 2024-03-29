import { range } from "../common";

test("range", () => {
  expect(() => range("C4", "G")).toThrow(
    "note.group must be both set or not set"
  );
  expect(() => range("C", "G4")).toThrow(
    "note.group must be both set or not set"
  );

  expect(range("C", "G").map((notes) => notes.join())).toStrictEqual([
    "C",
    "C♯",
    "D",
    "D♯",
    "E",
    "F",
    "F♯",
    "G",
  ]);

  expect(range("G#", "C", "flat").map((notes) => notes.join())).toStrictEqual([
    "A♭",
    "A",
    "B♭",
    "B",
    "C",
  ]);

  expect(range("G#", "C", "both").map((notes) => notes.join())).toStrictEqual([
    "G♯ A♭",
    "A",
    "A♯ B♭",
    "B",
    "C",
  ]);
});
