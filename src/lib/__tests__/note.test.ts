import { Interval } from "../interval";
import { AccidentalEnum, Note, NoteEnum } from "../note";

test("Note::from", () => {
  expect(() => Note.from("")).toThrow("invalid abbr: ");
  expect(() => Note.from("H")).toThrow("invalid abbr: H");
  expect(() => Note.from("Cx")).toThrow("invalid accidental: x");
  expect(() => Note.from("C10")).toThrow("invalid group: 10");

  expect(Note.from("c").name()).toBe("C");
  expect(Note.from("C1").nameWithGroup()).toBe("C1");
  expect(Note.from("Cb1").nameWithGroup()).toBe("Cb1");
  expect(Note.from(new Note(NoteEnum.A)).name()).toBe("A");
});

test("Note::accidental", () => {
  const note = Note.from("C##");
  expect(note.accidental).toBe(AccidentalEnum.DoubleSharp);

  note.accidental = AccidentalEnum.DoubleFlat;
  expect(note.name()).toBe("Cbb");
});

test("Note::group", () => {
  const note = Note.from("C3");
  expect(note.group).toBe(3);

  note.group = 4;
  expect(note.nameWithGroup()).toBe("C4");
});

test("Note::isNature", () => {
  expect(Note.from("C").isNature()).toBe(true);
  expect(Note.from("C♮").isNature()).toBe(true);
  expect(Note.from("C#").isNature()).toBe(false);
});

test("Note::isSharp", () => {
  expect(Note.from("C#").isSharp()).toBe(true);
  expect(Note.from("C").isSharp()).toBe(false);
});

test("Note::isFlat", () => {
  expect(Note.from("Cb").isFlat()).toBe(true);
  expect(Note.from("C").isFlat()).toBe(false);
});

test("Note::name", () => {
  const note = Note.from("C#3");

  expect(note.nameWithGroup()).toBe("C#3");
  expect(note.name()).toBe("C#");
  expect(note.name({ transformAccidental: true })).toBe("C♯");
});

test("Note::is", () => {
  expect(Note.from("A").is("A")).toBe(true);
  expect(Note.from("A♮").is("A")).toBe(true);
  expect(Note.from("A#").is("A", { checkAccidental: false })).toBe(true);
  expect(Note.from("A♮").is("Ab")).toBe(false);
  expect(Note.from("A3").is("A4")).toBe(true);
  expect(Note.from("A3").is("A4", { checkGroup: true })).toBe(false);
  expect(Note.from("A").is("A4", { checkGroup: true })).toBe(false);
});

test("Note::add", () => {
  // with group
  const note1 = Note.from("C3");

  expect(() => note1.add("H1").nameWithGroup()).toThrow(
    "unsupported interval: H1"
  );
  expect(note1.add("P1").nameWithGroup()).toBe("C3");
  expect(note1.add("P8").nameWithGroup()).toBe("C4");
  expect(note1.add(Interval.from("M3")).nameWithGroup()).toBe("E3");

  // without group
  const note2 = Note.from("C#");
  expect(note2.add("M2").nameWithGroup()).toBe("D#");
});

test("Note::minus", () => {
  // with group
  const note1 = Note.from("C3");

  expect(() => note1.minus("H1").nameWithGroup()).toThrow(
    "unsupported interval: H1"
  );
  expect(note1.minus("P1").nameWithGroup()).toBe("C3");
  expect(note1.minus("P8").minus("m2").nameWithGroup()).toBe("B1");
  expect(note1.minus(Interval.from("M3")).nameWithGroup()).toBe("Ab2");

  // without group
  const note2 = Note.from("C#");
  expect(note2.minus("M2").nameWithGroup()).toBe("B");
});

test("Note::to", () => {
  expect(Note.from("C").to(Note.from("C")).toAbbr()).toBe("P1");
  expect(Note.from("D#").to(Note.from("Eb")).toAbbr()).toBe("P1");

  expect(Note.from("C").to(Note.from("C#")).toAbbr()).toBe("H1");
  expect(Note.from("Cb").to(Note.from("C")).toAbbr()).toBe("H1");
  expect(Note.from("C#").to(Note.from("C")).toAbbr()).toBe("H1");
  expect(Note.from("B").to(Note.from("B#")).toAbbr()).toBe("H1");

  expect(Note.from("C").to(Note.from("D")).toAbbr()).toBe("M2");
  expect(Note.from("E").to(Note.from("F")).toAbbr()).toBe("m2");
  expect(Note.from("B").to(Note.from("C")).toAbbr()).toBe("m2");
  expect(Note.from("C#").to(Note.from("E")).toAbbr()).toBe("m3");
  expect(Note.from("A").to(Note.from("Cb")).toAbbr()).toBe("d3");
  expect(Note.from("Cb").to(Note.from("F#")).toAbbr()).toBe("AA4");
  expect(Note.from("C#").to(Note.from("Fb")).toAbbr()).toBe("dd4");
  expect(Note.from("Cb").to(Note.from("G#")).toAbbr()).toBe("AA5");
  expect(Note.from("C#").to(Note.from("Gb")).toAbbr()).toBe("dd5");
});
