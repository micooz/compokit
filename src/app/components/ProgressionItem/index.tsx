"use client";
import React, { useRef } from "react";
import classNames from "classnames";
import { Checkbox } from "primereact/checkbox";

import { Note } from "@/lib";
import { PercussionPad, PercussionPadRef } from "@/components/PercussionPad";
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
  onInvert: (index: number) => void;
  onOmitNote: (index: number, note: Note, omit: boolean) => void;
  onRemove: (index: number) => void;
}

export function ProgressionItem(props: ProgressionItemProps) {
  const { id, chords, pianoRef, disabled, onInvert, onOmitNote, onRemove } =
    props;

  const chordToolClassnames = classNames(
    "p-1 text-sm text-center cursor-pointer hover:bg-gray-200 active:bg-gray-300"
  );

  function Chord(props: { item: ChordItem; index: number }) {
    const { item, index } = props;

    const padRef = useRef<PercussionPadRef>(null);

    function onToggleOmitNote(note: Note, omit: boolean) {
      onOmitNote(index, note, omit);
      Promise.resolve().then(() => {
        console.log("show highlight", padRef.current);
        padRef.current?.highlight();
      });
    }

    function onToggleInvert() {
      onInvert(index);
      padRef.current?.highlight();
    }

    return (
      <div className="flex flex-col gap-2">
        <PercussionPad
          ref={padRef}
          className="relative flex flex-col items-center p-2 border cursor-pointer hover:bg-gray-100"
          notes={item.chord.noteNames()}
          omits={item.omits.names()}
          pianoRef={pianoRef}
          disabled={disabled}
          active={item.playing}
        >
          {/* remove icon */}
          {!disabled && (
            <TouchEvent onTouchStart={() => onRemove(index)}>
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
            {item.chord.toAbbr({ transformAccidental: true })}
          </span>
        </PercussionPad>

        {/* tools */}
        <div className="flex flex-col items-center">
          {/* omit control */}
          <div className="flex gap-1">
            {item.chord
              .rootPosition()
              .notes()
              .valueOf()
              .map((note, idx) => {
                const inputId = `checkbox-note_${id}_${index}_${idx}`;
                return (
                  <div key={idx} className="flex items-center gap-1">
                    <Checkbox
                      inputId={inputId}
                      checked={
                        !item.omits.include(note, {
                          checkAccidental: true,
                        })
                      }
                      disabled={disabled}
                      onChange={(e) => onToggleOmitNote(note, !e.checked)}
                    />
                    <label htmlFor={inputId}>
                      <TextBeauty>
                        {note.name({ transformAccidental: true })}
                      </TextBeauty>
                    </label>
                  </div>
                );
              })}
          </div>
          {/* inversion and position control */}
          <div className="w-full flex justify-center items-center">
            <span
              className={classNames(
                chordToolClassnames,
                "flex items-center gap-1"
              )}
              onClick={onToggleInvert}
            >
              <i
                className={classNames("fa-solid fa-repeat relative top-[1px]")}
                style={{ fontSize: "0.7rem" }}
              />
              {item.chord.inversionOrdinal()}
            </span>
            <span className={chordToolClassnames}>+8</span>
            <span className={chordToolClassnames}>-8</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="progressionItem overflow-auto select-none">
      {chords.length === 0 ? (
        <div className="text-xs text-center text-gray-400">No Chords Added</div>
      ) : (
        <div className="flex-1 flex gap-4 p-2 pb-4">
          {chords.map((item, index) => (
            <Chord key={index} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
