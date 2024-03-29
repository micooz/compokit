import { Note, NoteArray } from "./note";

export function transformObject<T, R>(
  obj: Record<string, T>,
  valueMapper: (key: string, value: T) => R
) {
  return Object.entries<T>(obj).reduce((acc, [key, value]) => {
    acc[key] = valueMapper(key, value);
    return acc;
  }, {} as Record<string, R>);
}

export function dedupBy<T>(arr: T[], func: (item: T) => any) {
  const map: Map<any, T> = new Map();

  for (const item of arr) {
    const key = func(item);
    map.set(key, item);
  }

  const uniqueArr: T[] = [];

  map.forEach((value) => {
    uniqueArr.push(value);
  });

  return uniqueArr;
}

export function range(
  from: Note | string,
  to: Note | string,
  accidental: "sharp" | "flat" | "both" = "sharp"
) {
  const list = [
    ["C"],
    ["C#", "Db"],
    ["D"],
    ["D#", "Eb"],
    ["E"],
    ["F"],
    ["F#", "Gb"],
    ["G"],
    ["G#", "Ab"],
    ["A"],
    ["A#", "Bb"],
    ["B"],
  ];

  const start = Note.from(from);
  const end = Note.from(to);

  if (
    (start.group !== undefined && end.group === undefined) ||
    (start.group === undefined && end.group !== undefined)
  ) {
    throw new Error("note.group must be both set or not set");
  }

  const opts = {
    checkAccidental: true,
    checkGroup: true,
  };

  const fromIndex = list.findIndex((item) =>
    item.some((it) => start.is(it, { ...opts, checkGroup: false }))
  );

  let index = fromIndex;
  let group = start.group;

  const notes: NoteArray[] = [];

  while (true) {
    if (index > list.length - 1) {
      index = 0;

      if (group !== undefined) {
        group += 1;
      }
    }

    const items = list[index];

    let abbrs: string[] = [];

    if (accidental === "sharp" || items.length === 1) {
      abbrs = [items[0]];
    } else if (accidental === "flat") {
      abbrs = [items[1]];
    } else if (accidental === "both") {
      abbrs = items;
    }

    const _notes = abbrs.map((abbr) => {
      const note = Note.from(abbr);

      if (group !== undefined) {
        note.group = group;
      }

      return note;
    });

    notes.push(NoteArray.from(_notes));

    if (_notes[0].is(end, opts) || _notes[1]?.is(end, opts)) {
      break;
    }

    index += 1;
  }

  return notes;
}
