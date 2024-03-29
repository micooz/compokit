import { Chord } from "../chord";

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
    "unable to determine the appropriate chord representation for: C E♯ G"
  );
});

test("Chord::inversion", () => {
  const chord = new Chord(["F", "A", "C"]);
  expect(chord.inversion().join()).toBe("A C F");

  // with group
  const chord2 = new Chord(["G4", "B4", "D5", "F5"]);
  expect(chord2.inversion(1).join()).toBe("B4 D5 F5 G5");
  expect(chord2.inversion(2).join()).toBe("D5 F5 G5 B5");
  expect(chord2.inversion(3).join()).toBe("F5 G5 B5 D6");
});
