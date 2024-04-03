"use client";
import React, { useEffect, useMemo, useRef } from "react";
import classNames from "classnames";
import { Checkbox } from "primereact/checkbox";

import { Note } from "@/lib";
import { PercussionPad } from "@/components/PercussionPad";
import { PianoKeyboardRef } from "@/components/PianoKeyboard";
import { TextBeauty } from "@/components/TextBeauty";
import { TouchEvent } from "@/components/TouchEvent";

import { ChordItem, ProgressionVO } from "../ProgressionDesigner/share";
import "./index.scss";

export interface ProgressionItemProps {
  id: number;
  progression: ProgressionVO;
  pianoRef: React.RefObject<PianoKeyboardRef>;
  disabled?: boolean;
  showModeStepHint?: boolean;
  showChordTransformTools?: boolean;
  onInvertChord: (index: number) => void;
  onToggleOmitNote: (index: number, note: Note, omit: boolean) => void;
  onToggleOctaveChord: (index: number, octave: 0 | 8 | -8) => void;
  onToggleSelectChord: (index: number, selected: boolean) => void;
  onInsertChord: (index: number) => void;
  onRemoveChord: (index: number) => void;
}

export function ProgressionItem(props: ProgressionItemProps) {
  const { progression, showModeStepHint } = props;
  const { chords, arrangement } = progression;

  const showHint = showModeStepHint && chords.every((chord) => !!chord.mode);

  return (
    <div className="progressionItem overflow-auto select-none">
      {chords.length === 0 ? (
        <div className="text-xs text-center text-gray-400">No Chords Added</div>
      ) : (
        <div
          className={classNames("flex-1 flex", {
            "flex-wrap": arrangement === "vertical",
          })}
        >
          {chords.map((current, index) => (
            <div key={index} className="relative">
              {showHint && (
                <ModeStepHint current={current} previous={chords[index - 1]} />
              )}
              <Chord parentProps={props} current={current} index={index} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ModeStepHintProps {
  previous?: ChordItem;
  current: ChordItem;
}

function ModeStepHint(props: ModeStepHintProps) {
  const { current, previous } = props;

  const showMode = current.mode!.name() !== previous?.mode!.name();

  return (
    <div
      className={classNames(
        "flex items-center gap-2 text-sm py-1 whitespace-nowrap"
      )}
    >
      {showMode && (
        <div className="ml-3 border-l-2 border-transparent">
          {current.mode!.name({
            shortName: true,
            transformAccidental: true,
          })}
        </div>
      )}
      <div className="flex-1 flex justify-center items-center gap-2">
        {!showMode && <div className="pl-[29%] border-b border-gray-200 " />}
        <div>{current.step}</div>
        <div className="flex-1 border-b border-gray-200" />
      </div>
    </div>
  );
}

interface ChordProps {
  parentProps: ProgressionItemProps;
  current: ChordItem;
  index: number;
}

function Chord(props: ChordProps) {
  const { parentProps, current, index } = props;

  const {
    id,
    progression,
    pianoRef,
    disabled,
    showChordTransformTools,
    onInvertChord,
    onToggleOmitNote,
    onToggleOctaveChord,
    onToggleSelectChord,
    onRemoveChord,
    onInsertChord,
  } = parentProps;

  const { chord, inversion, omits, octave, playing, selected } = current;

  const chordToolClassnames = classNames(
    "px-1 text-sm text-center cursor-pointer"
  );

  const notes = current.chord.notes().valueOf();

  const domRef = useRef<HTMLDivElement>(null);

  const notesForPad = useMemo(() => {
    return chord
      .inverse(inversion)
      .notes()
      .withGroup(3, { omits, octave })
      .names();
  }, [chord, inversion, omits, octave]);

  useEffect(() => {
    if (playing) {
      domRef.current?.scrollIntoView(false);
    }
  }, [playing]);

  return (
    <div className="flex">
      <div
        ref={domRef}
        className={classNames("relative flex flex-col gap-2 border-2 p-3", {
          "border-transparent": !selected,
          "border-orange-300 bg-orange-50": selected,
        })}
      >
        {/* pad */}
        <PercussionPad
          className="relative flex flex-col items-center p-1 px-3 border cursor-pointer hover:bg-gray-100"
          notes={notesForPad}
          pianoRef={pianoRef}
          disabled={disabled}
          active={playing}
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
            {chord.inverse(inversion).toAbbr({ transformAccidental: true })}
          </span>
        </PercussionPad>

        {/* tools */}
        <div className="flex flex-col items-center gap-1">
          {showChordTransformTools && (
            <React.Fragment>
              {/* omit control */}
              <div className="flex gap-1">
                {chord
                  .rootPosition()
                  .notes()
                  .valueOf()
                  .map((note, idx) => {
                    const inputId = `checkbox-note_${id}_${index}_${idx}`;
                    return (
                      <div key={idx} className="flex items-center">
                        <Checkbox
                          inputId={inputId}
                          checked={!omits.includes(note)}
                          disabled={
                            disabled ||
                            // for non-triad chords, prevent the last note from omitting.
                            (notes.length >= 4 && idx === notes.length - 1)
                          }
                          onChange={(e) =>
                            onToggleOmitNote(index, note, !e.checked)
                          }
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
                    "flex items-center gap-1 hover:bg-gray-200 active:bg-gray-300",
                    {
                      "pointer-events-none": disabled,
                    }
                  )}
                  onClick={() => onInvertChord(index)}
                >
                  <i
                    className={classNames(
                      "fa-solid fa-repeat relative top-[1px]"
                    )}
                    style={{ fontSize: "0.7rem" }}
                  />
                  {inversion}
                </div>
                {/* +8 */}
                <div
                  className={classNames(chordToolClassnames, "w-7", {
                    "bg-[#3a7bd0] text-white": octave === 8,
                    "pointer-events-none": disabled,
                  })}
                  onClick={() => onToggleOctaveChord(index, 8)}
                >
                  +8
                </div>
                {/* -8 */}
                <div
                  className={classNames(chordToolClassnames, "w-7", {
                    "bg-[#3a7bd0] text-white": octave === -8,
                    "pointer-events-none": disabled,
                  })}
                  onClick={() => onToggleOctaveChord(index, -8)}
                >
                  -8
                </div>
              </div>
            </React.Fragment>
          )}

          {/* select icon */}
          <div className="flex items-center gap-1">
            <Checkbox
              inputId={`checkbox-chord_${id}_${index}`}
              checked={selected}
              disabled={disabled}
              onChange={(e) => onToggleSelectChord(index, !!e.checked)}
            />
            <label
              htmlFor={`checkbox-chord_${id}_${index}`}
              className="text-sm cursor-pointer"
            >
              Select
            </label>
          </div>
        </div>
      </div>

      {/* insert icon */}
      <div>
        <i
          className={classNames(
            "fa-solid fa-add mt-5 mx-1 p-1 text-sm border",
            "cursor-pointer text-gray-300 hover:text-gray-500",
            {
              "border-transparent": progression.insertIndex !== index,
              "border-orange-300 bg-orange-50 text-gray-500":
                progression.insertIndex === index,
            }
          )}
          onClick={() => onInsertChord(index)}
        />
      </div>
    </div>
  );
}
