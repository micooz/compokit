"use client";
import React, { useMemo } from "react";
import classNames from "classnames";
import { Checkbox } from "primereact/checkbox";

import { Note } from "@/lib";
import { PercussionPad } from "@/components/PercussionPad";
import { PianoKeyboardRef } from "@/components/PianoKeyboard";
import { TextBeauty } from "@/components/TextBeauty";
import { TouchEvent } from "@/components/TouchEvent";

import { ChordItem } from "../ProgressionDesigner/share";
import "./index.scss";

export interface ProgressionItemProps {
  id: number;
  chords: ChordItem[];
  pianoRef: React.RefObject<PianoKeyboardRef>;
  disabled?: boolean;
  onInvertChord: (index: number) => void;
  onToggleOmitNote: (index: number, note: Note, omit: boolean) => void;
  onToggleOctaveChord: (index: number, octave: 0 | 8 | -8) => void;
  onToggleReplaceChord: (index: number, replace: boolean) => void;
  onRemoveChord: (index: number) => void;
}

export function ProgressionItem(props: ProgressionItemProps) {
  const { chords } = props;

  return (
    <div className="progressionItem overflow-auto select-none">
      {chords.length === 0 ? (
        <div className="text-xs text-center text-gray-400">No Chords Added</div>
      ) : (
        <div className="flex-1 flex p-2 pb-4">
          {chords.map((item, index) => (
            <Chord key={index} parentProps={props} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ChordProps {
  parentProps: ProgressionItemProps;
  item: ChordItem;
  index: number;
}

function Chord(props: ChordProps) {
  const { parentProps, item, index } = props;

  const {
    id,
    pianoRef,
    disabled,
    onInvertChord,
    onToggleOmitNote,
    onToggleOctaveChord,
    onToggleReplaceChord,
    onRemoveChord,
  } = parentProps;

  const chordToolClassnames = classNames(
    "px-1 text-sm text-center cursor-pointer"
  );

  const notes = item.chord.notes().valueOf();

  const notesForPad = useMemo(() => {
    return item.chord
      .inversion(item.inversion)
      .notes()
      .withGroup(3, { omits: item.omits, octave: item.octave })
      .names({ transformAccidental: false });
  }, [item.chord, item.inversion, item.omits, item.octave]);

  return (
    <div
      className={classNames(
        "flex flex-col gap-2 border-2 border-transparent p-3",
        {
          "border-2 border-orange-300 bg-orange-50": item.replacing,
        }
      )}
    >
      <PercussionPad
        className="relative flex flex-col items-center p-2 border cursor-pointer hover:bg-gray-100"
        notes={notesForPad}
        pianoRef={pianoRef}
        disabled={disabled}
        active={item.playing}
      >
        {/* remove icon */}
        {!disabled && (
          <TouchEvent onTouchStart={() => onRemoveChord(index)}>
            <i
              className={classNames(
                "pi pi-times-circle text-black bg-white rounded-full",
                "cursor-pointer hover:text-red-600",
                "absolute right-0 top-0 translate-x-1/2 -translate-y-1/2"
              )}
            />
          </TouchEvent>
        )}

        {/* chord label */}
        <span className="mb-1 font-semibold">
          {item.chord
            .inversion(item.inversion)
            .toAbbr({ transformAccidental: true })}
        </span>
      </PercussionPad>

      {/* tools */}
      <div className="flex flex-col items-center gap-1">
        {/* omit control */}
        <div className="flex gap-1">
          {item.chord
            .rootPosition()
            .notes()
            .valueOf()
            .map((note, idx) => {
              const inputId = `checkbox-note_${id}_${index}_${idx}`;
              return (
                <div key={idx} className="flex items-center">
                  <Checkbox
                    inputId={inputId}
                    checked={
                      !item.omits.include(note, {
                        checkAccidental: true,
                      })
                    }
                    disabled={
                      disabled ||
                      // for non-triad chords, prevent the last note from omitting.
                      (notes.length >= 4 && idx === notes.length - 1)
                    }
                    onChange={(e) => onToggleOmitNote(index, note, !e.checked)}
                  />
                  <label
                    htmlFor={inputId}
                    className="text-sm cursor-pointer ml-1"
                  >
                    <TextBeauty>
                      {note.name({ transformAccidental: true })}
                    </TextBeauty>
                  </label>
                </div>
              );
            })}
        </div>

        {/* inversion and octave control */}
        <div className="w-full flex justify-center items-center">
          {/* inversion */}
          <div
            className={classNames(
              chordToolClassnames,
              "flex items-center gap-1 hover:bg-gray-200 active:bg-gray-300"
            )}
            onClick={() => onInvertChord(index)}
          >
            <i
              className={classNames("fa-solid fa-repeat relative top-[1px]")}
              style={{ fontSize: "0.7rem" }}
            />
            {item.inversion}
          </div>
          {/* +8 */}
          <div
            className={classNames(chordToolClassnames, "w-7", {
              "bg-[#3a7bd0] text-white": item.octave === 8,
            })}
            onClick={() => onToggleOctaveChord(index, 8)}
          >
            +8
          </div>
          {/* -8 */}
          <div
            className={classNames(chordToolClassnames, "w-7", {
              "bg-[#3a7bd0] text-white": item.octave === -8,
            })}
            onClick={() => onToggleOctaveChord(index, -8)}
          >
            -8
          </div>
        </div>

        {/* replace icon */}
        <div className="flex items-center gap-1">
          <Checkbox
            inputId={`checkbox-chord_${id}_${index}`}
            checked={item.replacing}
            disabled={disabled}
            onChange={(e) => onToggleReplaceChord(index, !!e.checked)}
          />
          <label
            htmlFor={`checkbox-chord_${id}_${index}`}
            className="text-sm cursor-pointer"
          >
            Replace
          </label>
        </div>
      </div>
    </div>
  );
}
