import { dedupBy } from "./utils";
import { Interval } from "./interval";
import { Note } from "./note";
import { NoteIsOptions, NoteToNameOptions, NoteType, Notes } from "./types";

export type WithGroupOptions = {
  // autoGroup?: boolean;
  omits?: NoteArray;
  octave?: 0 | 8 | -8;
  noteIsOptions?: NoteIsOptions;
};

export class NoteArray {
  private _notes: Note[] = [];

  constructor(src: Notes) {
    if (src instanceof NoteArray) {
      this._notes = src.valueOf().map((note) => note.clone());
    } else if (src.length !== 0) {
      if (typeof src[0] === "string") {
        this._notes = (src as string[]).map((note) => Note.from(note));
      } else {
        this._notes = (src as Note[]).map((note) => note.clone());
      }
    }
  }

  static from(notes: Notes) {
    return new NoteArray(notes);
  }

  valueOf() {
    return this._notes;
  }

  count() {
    return this._notes.length;
  }

  get(index: number): Note | undefined {
    return this._notes[index]?.clone();
  }

  root() {
    return this._notes[0].clone();
  }

  /**
   * calculate intervals in pairs
   */
  intervals() {
    const intervals: Interval[] = [];

    this.forPair((prev, next) => {
      const inter = prev.to(next);
      intervals.push(inter);
    });

    return intervals;
  }

  map(func: (note: Note, index: number, array: Note[]) => Note) {
    const notes = this._notes.map(func);
    return new NoteArray(notes);
  }

  dedup() {
    const notes = dedupBy(this._notes, (note) => note.name());
    return new NoteArray(notes);
  }

  clone() {
    return new NoteArray(this._notes.map((note) => note.clone()));
  }

  join(separator = " ", opts?: NoteToNameOptions) {
    return this.names(opts).join(separator);
  }

  names(opts?: NoteToNameOptions) {
    return this._notes.map((note) => note.nameWithGroup(opts));
  }

  withGroup(base: number, opts?: WithGroupOptions) {
    const { omits, octave = 0, noteIsOptions } = opts || {};

    let group = base;

    if (octave === 8) {
      group += 1;
    }
    if (octave === -8) {
      group -= 1;
    }

    // if (autoGroup) {
    //   const first = this._notes[0];
    //   const size = this._notes.length;

    //   // triad
    //   if (size <= 3 && first.index <= NoteEnum.E) {
    //     group += 1;
    //   }
    //   // seventh
    //   if (size <= 4 && first.index === NoteEnum.C) {
    //     group += 1;
    //   }
    // }

    const notes = this._notes.map((note, index) => {
      const currentNote = note.clone();
      const prevNote = this._notes[index - 1];

      if (prevNote && currentNote.index < prevNote.index) {
        group += 1;
      }

      currentNote.group = group;

      return currentNote;
    });

    let arr = new NoteArray(notes);

    if (omits && omits.count() > 0) {
      arr = arr.omit(omits, noteIsOptions);
    }

    return arr;
  }

  includes(note: NoteType, opts?: NoteIsOptions) {
    for (const item of this._notes) {
      if (Note.from(note).is(item, opts)) {
        return true;
      }
    }
    return false;
  }

  is(arr: NoteArray, opts?: NoteIsOptions) {
    if (this.count() !== arr.count()) {
      return false;
    }

    for (let i = 0; i < this.count(); i += 1) {
      if (!this.get(i)?.is(arr.get(i)!, opts)) {
        return false;
      }
    }

    return true;
  }

  private forPair(func: (prev: Note, next: Note) => void) {
    return this._notes.reduce((prev, next) => {
      func(prev, next);
      return next;
    });
  }

  private omit(notes: NoteArray, opts?: NoteIsOptions) {
    const newNotes = this._notes.filter((item) => !notes.includes(item, opts));
    return NoteArray.from(newNotes);
  }
}
