import { ChordTypeEnum } from "../chord";
import { Mode, ModeEnum } from "../mode";
import { Note } from "../note";

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
      `${scale.name({ transformAccidental: true })}: ${scale.notes().join()}`
  );

  expect(lines).toMatchSnapshot();
});

test("scale note with group should match", () => {
  const scale = Mode.from("Ab3", ModeEnum.NaturalMajor);

  expect(scale.notes().join()).toBe("A♭3 B♭3 C4 D♭4 E♭4 F4 G4");
});

test("unknown mode should throw", () => {
  // @ts-expect-error
  expect(() => Mode.from("C3", -1)).toThrow();
});

test("Mode::chord", () => {
  const mode = Mode.from("Eb", ModeEnum.NaturalMajor);

  expect(() => mode.chord(0, ChordTypeEnum.Triad)).toThrow(
    "step must be between 1 and 7"
  );

  expect(mode.chord(1).join()).toBe("E♭ G B♭");
  expect(mode.chord(2, ChordTypeEnum.Seventh).join()).toBe("F A♭ C E♭");
  // expect(mode.chord(3, ChordTypeEnum.Ninth).join()).toBe(
  //   "G B♭ D F A♭"
  // );
  // expect(mode.chord(4, ChordTypeEnum.Eleventh).join()).toBe(
  //   "A♭ C E♭ G B♭ D"
  // );

  // with group
  const mode2 = Mode.from("C4", ModeEnum.NaturalMajor);
  expect(mode2.chord(5).join()).toBe("G4 B4 D5");
});

test("Mode::transpose", () => {
  expect(
    Mode.from("Eb", ModeEnum.NaturalMajor).transpose("low", "m3").notes().join()
  ).toBe("C D E F G A B");

  expect(
    Mode.from("A", ModeEnum.NaturalMinor).transpose("high", "m3").notes().join()
  ).toBe("C D E♭ F G A♭ B♭");
});

test("Mode::parallel", () => {
  expect(Mode.from("C", ModeEnum.NaturalMajor).parallel().notes().join()).toBe(
    "C D E♭ F G A♭ B♭"
  );

  expect(Mode.from("C", ModeEnum.HarmonicMinor).parallel().notes().join()).toBe(
    "C D E F G A♭ B"
  );

  expect(() => new Mode([]).parallel()).toThrow(
    "parallel() only works on major or minor mode"
  );
});

test("Mode::relative", () => {
  expect(Mode.from("C", ModeEnum.NaturalMajor).relative().notes().join()).toBe(
    "A B C D E F G"
  );

  expect(Mode.from("A", ModeEnum.HarmonicMinor).relative().notes().join()).toBe(
    "C D E F G A♭ B"
  );

  expect(() => new Mode([]).relative()).toThrow(
    "relative() only works on major or minor mode"
  );
});

test("Mode::name", () => {
  const scale = new Mode([Note.from("C"), Note.from("Eb")]);

  expect(scale.notes().join()).toBe("C E♭");
  expect(scale.name({ transformAccidental: true })).toBe("C Unknown Mode");
});
