import { dedupBy } from "./common";
import { Interval } from "./interval";
import {
  Note,
  NoteEnum,
  NoteIsOptions,
  NoteToNameOptions,
  Notes,
} from "./note";

export type WithGroupOptions = {
  autoGroup?: boolean;
  omits?: NoteArray;
  octave?: 0 | 8 | -8;
  checkGroup?: boolean;
};

export class NoteArray {
  private _notes: Note[] = [];

  constructor(notes: Notes) {
    if (notes.length === 0) {
      this._notes = [];
    }
    if (typeof notes[0] === "string") {
      this._notes = (notes as string[]).map((note) => Note.from(note));
    }
    if (notes[0] instanceof Note) {
      this._notes = (notes as Note[]).map((note) => note.clone());
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

  get(index: number) {
    return this._notes[index].clone();
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

  forPair(func: (prev: Note, next: Note) => void) {
    return this._notes.reduce((prev, next) => {
      func(prev, next);
      return next;
    });
  }

  clone() {
    return new NoteArray(this._notes.map((note) => note.clone()));
  }

  join(separator = " ", opts?: NoteToNameOptions) {
    return this.names(opts).join(separator);
  }

  names(opts?: NoteToNameOptions) {
    return this._notes.map((note) =>
      note.nameWithGroup({ transformAccidental: true, ...opts })
    );
  }

  withGroup(base: number, opts?: WithGroupOptions) {
    const {
      autoGroup = false,
      omits,
      octave = 0,
      checkGroup = false,
    } = opts || {};

    let group = base;

    if (octave === 8) {
      group += 1;
    }
    if (octave === -8) {
      group -= 1;
    }

    if (autoGroup) {
      const first = this._notes[0];
      const size = this._notes.length;

      // triad
      if (size <= 3 && first.index <= NoteEnum.E) {
        group = 4;
      }
      // seventh
      if (size <= 4 && first.index === NoteEnum.C) {
        group = 4;
      }
    }

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
      arr = arr.omit(omits, { checkAccidental: true, checkGroup });
    }

    return arr;
  }

  include(note: Note, opts?: NoteIsOptions) {
    for (const item of this._notes) {
      if (note.is(item, opts)) {
        return true;
      }
    }
    return false;
  }

  omit(notes: NoteArray, opts?: NoteIsOptions) {
    const newNotes = this._notes.filter((item) => !notes.include(item));
    return NoteArray.from(newNotes);
  }
}
