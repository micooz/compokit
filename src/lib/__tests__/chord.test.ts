import { Chord } from "../chord";
import { Mode } from "../mode";
import { ModeEnum } from "../types";

test("Chord::new", () => {
  expect(() => new Chord([])).toThrow("chord must contain at least three note");
  expect(() => new Chord(["C", "D", "E"])).toThrow(
    "cannot form a chord with these notes: C D E"
  );

  expect(new Chord(["C", "E", "G"]).toAbbr()).toBe("C");
  expect(new Chord(["C", "Eb", "G"]).toAbbr()).toBe("Cm");
  expect(new Chord(["C", "Eb", "Gb"]).toAbbr()).toBe("Cdim");
  expect(new Chord(["C", "E", "G#"]).toAbbr()).toBe("Caug");
  expect(new Chord(["E", "G", "C"]).toAbbr()).toBe("C/E");
  expect(new Chord(["C", "E", "G", "B"]).toAbbr()).toBe("Cmaj7");
  expect(new Chord(["C", "E", "G", "Bb"]).toAbbr()).toBe("C7");
  expect(new Chord(["C", "Eb", "Gb", "Bb"]).toAbbr()).toBe("Cm7(♭5)");

  expect(() => new Chord(["C", "E#", "G"]).toAbbr()).toThrow(
    "unable to determine the appropriate chord representation for: C E# G"
  );
});

test("Chord::fromAbbr", () => {
  //
});

test("Chord::toAbbr", () => {
  const chord = new Chord(["E", "G", "C"]);
  expect(chord.toAbbr()).toBe("C/E");
});

test("Chord::inverse", () => {
  const chord = new Chord(["F", "A", "C"]);
  expect(chord.inverse().notes().join()).toBe("A C F");

  // with group
  const chord2 = new Chord(["G4", "B4", "D5", "F5"]);
  expect(chord2.inverse(1).notes().join()).toBe("B4 D5 F5 G5");
  expect(chord2.inverse(2).notes().join()).toBe("D5 F5 G5 B5");
  expect(chord2.inverse(3).notes().join()).toBe("F5 G5 B5 D6");
});

test("Chord::inversion", () => {
  const chord = new Chord(["E", "G", "C"]);
  expect(chord.inversion()).toBe(1);
});

test("Chord::rootPosition", () => {
  const chord = new Chord(["E", "G", "C"]);
  expect(chord.rootPosition().notes().join()).toBe("C E G");
});

test("Chord::notes", () => {
  const chord = new Chord(["E", "G", "C"]);
  expect(chord.notes().join()).toBe("E G C");
});

test("Chord::is", () => {
  const chord = new Chord(["E", "G", "C"]);

  expect(chord.is(new Chord(["C", "E", "G"]))).toBe(true);
  expect(chord.is(new Chord(["C", "E", "G"]), { checkInversion: true })).toBe(
    false
  );
});

test("Chord::resolveTo", () => {
  const format = (chord: Chord) => ({
    chord: chord.toAbbr(),
    mode: chord.mode()!.name(),
    step: chord.step(),
  });

  const chords = [
    new Chord(["G", "B", "D"], Mode.from("C", ModeEnum.NaturalMajor)),
    new Chord(["G", "B", "D", "F"], Mode.from("C", ModeEnum.NaturalMajor)),
    new Chord(["G", "Bb", "Db", "F"], Mode.from("F", ModeEnum.HarmonicMinor)),
  ];

  const snapshot = chords.map((chord) => {
    const to = chord
      .resolveTo({ algorithm: "closely-related-modes" })
      .map((chord) => format(chord));

    return {
      from: format(chord),
      to,
    };
  });

  expect(snapshot).toMatchSnapshot();
});

test("Chord::clone", () => {
  const chord = new Chord(["E", "G", "C"]);
  expect(chord.clone().is(chord)).toBe(true);
});
