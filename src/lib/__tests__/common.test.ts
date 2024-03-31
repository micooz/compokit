import { range } from "../common";

test("range", () => {
  expect(() => range("C4", "G")).toThrow(
    "note.group must be both set or not set"
  );
  expect(() => range("C", "G4")).toThrow(
    "note.group must be both set or not set"
  );

  expect(range("C3", "E3").map((notes) => notes.join())).toEqual([
    "C3",
    "C#3",
    "D3",
    "D#3",
    "E3",
  ]);

  expect(range("A3", "C4").map((notes) => notes.join())).toEqual([
    "A3",
    "A#3",
    "B3",
    "C4",
  ]);

  expect(range("G#", "C", "flat").map((notes) => notes.join())).toEqual([
    "Ab",
    "A",
    "Bb",
    "B",
    "C",
  ]);

  expect(range("G#", "C", "both").map((notes) => notes.join())).toEqual([
    "G# Ab",
    "A",
    "A# Bb",
    "B",
    "C",
  ]);
});
