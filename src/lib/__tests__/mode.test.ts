import { Mode } from "../mode";
import { Note } from "../note";
import { ChordTypeEnum, ModeEnum } from "../types";

test("scale notes should match", () => {
  const scales = [
    // majors
    ...["C", "G", "D", "A", "E", "B", "Gb", "Db", "Ab", "Eb", "Bb", "F"].map(
      (key) => Mode.from(Note.from(key), ModeEnum.NaturalMajor)
    ),
    // minors
    ...["A", "E", "B", "F#", "C#", "G#", "D#", "Bb", "F", "C", "G", "D"].map(
      (key) => Mode.from(Note.from(key), ModeEnum.NaturalMinor)
    ),
    ...["A", "E", "B", "F#", "C#", "G#", "D#", "Bb", "F", "C", "G", "D"].map(
      (key) => Mode.from(Note.from(key), ModeEnum.HarmonicMinor)
    ),
  ];

  const lines = scales.map(
    (scale) =>
      `${scale.name({ transformAccidental: true })}: ${scale
        .notes()
        .join(" ", { transformAccidental: true })}`
  );

  expect(lines).toMatchSnapshot();
});

test("scale note with group should match", () => {
  const scale = Mode.from("Ab3", ModeEnum.NaturalMajor);

  expect(scale.notes().join()).toBe("Ab3 Bb3 C4 Db4 Eb4 F4 G4");
});

test("unknown mode should throw", () => {
  // @ts-expect-error
  expect(() => Mode.from("C3", -1)).toThrow();
});

test("Mode:new", () => {
  expect(() => new Mode([])).toThrow("mode must contains at least one note");
  expect(() => new Mode(["C"])).not.toThrow();
});

test("Mode:modes", () => {
  expect(Mode.modes()).toMatchSnapshot();
});

test("Mode:getKeys", () => {
  expect(
    Mode.getKeys(ModeEnum.NaturalMajor).names({ transformAccidental: true })
  ).toMatchSnapshot();
  expect(() => Mode.getKeys(-1 as any)).toThrow("unknown mode: -1");

  expect(Mode.getKeys(ModeEnum.NaturalMajor).names()).toEqual([
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "F#",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ]);

  expect(Mode.getKeys(ModeEnum.HarmonicMinor).names()).toEqual([
    "C",
    "C#",
    "D",
    "Eb",
    "E",
    "F",
    "F#",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ]);
});

test("Mode:key", () => {
  expect(Mode.from("C4", ModeEnum.Aeolian).key().name()).toBe("C");
});

test("Mode:type", () => {
  expect(Mode.from("C4", ModeEnum.Aeolian).type()).toBe(ModeEnum.Aeolian);
});

test("Mode::chord", () => {
  const mode = Mode.from("Eb", ModeEnum.NaturalMajor);

  expect(() => mode.chord(0, ChordTypeEnum.Triad)).toThrow(
    "step must be between 1 and 7"
  );
  expect(() => mode.chord(1, -1 as any)).toThrow("unknown chord type: -1");

  expect(mode.chord(1, ChordTypeEnum.Triad).notes().join()).toBe("Eb G Bb");
  expect(mode.chord(2, ChordTypeEnum.Seventh).notes().join()).toBe("F Ab C Eb");
  // expect(mode.chord(3, ChordTypeEnum.Ninth).join()).toBe(
  //   "G Bb D F Ab"
  // );
  // expect(mode.chord(4, ChordTypeEnum.Eleventh).join()).toBe(
  //   "Ab C Eb G Bb D"
  // );

  // with group
  const mode2 = Mode.from("C4", ModeEnum.NaturalMajor);
  expect(mode2.chord(5, ChordTypeEnum.Triad).notes().join()).toBe("G4 B4 D5");
});

test("Mode::chords", () => {
  const mode = Mode.from("Eb", ModeEnum.NaturalMajor);

  expect(
    mode.chords(ChordTypeEnum.Triad).map((item) => item.toJSON())
  ).toMatchSnapshot();
});

test("Mode::transpose", () => {
  expect(
    Mode.from("Eb", ModeEnum.NaturalMajor).transpose("low", "m3").notes().join()
  ).toBe("C D E F G A B");

  expect(
    Mode.from("A", ModeEnum.NaturalMinor).transpose("high", "m3").notes().join()
  ).toBe("C D Eb F G Ab Bb");
});

test("Mode::parallel", () => {
  expect(Mode.from("C", ModeEnum.NaturalMajor).parallel().notes().join()).toBe(
    "C D Eb F G Ab Bb"
  );

  expect(Mode.from("C", ModeEnum.HarmonicMinor).parallel().notes().join()).toBe(
    "C D E F G Ab B"
  );

  expect(() => new Mode(["C"]).parallel()).toThrow(
    "parallel() only works on major or minor mode"
  );
});

test("Mode::relative", () => {
  expect(Mode.from("C", ModeEnum.NaturalMajor).relative().notes().join()).toBe(
    "A B C D E F G"
  );

  expect(Mode.from("A", ModeEnum.HarmonicMinor).relative().notes().join()).toBe(
    "C D E F G Ab B"
  );

  expect(() => new Mode(["C"]).relative()).toThrow(
    "relative() only works on major or minor mode"
  );
});

test("Mode::dominant", () => {
  const mode = Mode.from("C", ModeEnum.NaturalMajor);
  expect(mode.dominant().name()).toBe("G Natural Major");
});

test("Mode::subDominant", () => {
  const mode = Mode.from("C", ModeEnum.NaturalMajor);
  expect(mode.subDominant().name()).toBe("F Natural Major");
});

test("Mode::name", () => {
  const mode = new Mode([Note.from("C"), Note.from("Eb")]);
  expect(mode.name()).toBe("C Unknown Mode");

  const mode3 = Mode.from("C", ModeEnum.HarmonicMajor);
  expect(mode3.name({ shortName: true })).toBe("C Major");
});

test("Mode::notes", () => {
  const mode = new Mode([Note.from("C"), Note.from("Eb")]);
  expect(mode.notes().join()).toBe("C Eb");
});

test("Mode::clone", () => {
  const mode = new Mode([Note.from("C"), Note.from("Eb")]);
  expect(mode.clone().notes().join()).toBe("C Eb");
});

test("Mode::is", () => {
  expect(
    Mode.from("C", ModeEnum.Aeolian).is(Mode.from("C", ModeEnum.Dorian))
  ).toBe(false);

  expect(
    Mode.from("C", ModeEnum.Aeolian).is(Mode.from("D", ModeEnum.Aeolian))
  ).toBe(false);

  expect(
    Mode.from("C", ModeEnum.Aeolian).is(Mode.from("C", ModeEnum.Aeolian))
  ).toBe(true);
});

test("Mode::isMajorMinor", () => {
  const mode = Mode.from("C", ModeEnum.Aeolian);
  expect(mode.isMajorMinor()).toBe(false);
});
