import { Note } from "../note";
import { NoteArray } from "../note-array";

test("NoteArray::new", () => {
  expect(new NoteArray([]).count()).toBe(0);
  expect(new NoteArray(["C"]).names()).toEqual(["C"]);
  expect(new NoteArray([Note.from("C")]).names()).toEqual(["C"]);
  expect(new NoteArray(new NoteArray(["C"])).names()).toEqual(["C"]);
});

test("NoteArray::from", () => {
  expect(NoteArray.from(["C"]).names()).toEqual(["C"]);
});

test("NoteArray::valueOf", () => {
  expect(NoteArray.from(["C"]).valueOf()[0].name()).toEqual("C");
});

test("NoteArray::count", () => {
  expect(NoteArray.from(["C"]).count()).toBe(1);
});

test("NoteArray::get", () => {
  expect(NoteArray.from(["C"]).get(0)!.name()).toBe("C");
  expect(NoteArray.from(["C"]).get(1)).toBe(undefined);
});

test("NoteArray::root", () => {
  expect(NoteArray.from(["C"]).root().name()).toBe("C");
});

test("NoteArray::intervals", () => {
  expect(
    NoteArray.from(["D", "E", "F"])
      .intervals()
      .map((inter) => inter.toAbbr())
  ).toEqual(["M2", "m2"]);
});

test("NoteArray::map", () => {
  expect(
    NoteArray.from(["D", "E", "F"])
      .map((note) => note.add("m2"))
      .names()
  ).toEqual(["Eb", "F", "Gb"]);
});

test("NoteArray::dedup", () => {
  expect(NoteArray.from(["D", "E", "F", "E"]).dedup().names()).toEqual([
    "D",
    "E",
    "F",
  ]);
});

test("NoteArray::clone", () => {
  expect(NoteArray.from(["C", "D"]).clone().names()).toEqual(["C", "D"]);
});

test("NoteArray::join", () => {
  expect(NoteArray.from(["C", "D"]).join()).toBe("C D");
});

test("NoteArray::names", () => {
  expect(NoteArray.from(["C3", "D3"]).names()).toEqual(["C3", "D3"]);
});

test("NoteArray::withGroup", () => {
  expect(NoteArray.from(["A", "B", "C"]).withGroup(4).names()).toEqual([
    "A4",
    "B4",
    "C5",
  ]);

  expect(
    NoteArray.from(["C", "D"]).withGroup(4, { octave: 8 }).names()
  ).toEqual(["C5", "D5"]);

  expect(
    NoteArray.from(["C", "D"]).withGroup(4, { octave: -8 }).names()
  ).toEqual(["C3", "D3"]);

  expect(
    NoteArray.from(["C4", "D4", "C5"])
      .withGroup(4, { omits: NoteArray.from(["C"]) })
      .names()
  ).toEqual(["D4"]);
});

test("NoteArray::include", () => {
  expect(NoteArray.from(["C3", "D3"]).includes("C")).toBe(true);
  expect(NoteArray.from(["C3", "D3"]).includes("D#")).toBe(false);
  expect(NoteArray.from(["C3", "D3"]).includes("D", { checkGroup: true })).toBe(
    false
  );
});
