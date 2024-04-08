"use client";
import React, { RefObject, useEffect, useMemo, useRef } from "react";
import classNames from "classnames";
import { useReactive } from "ahooks";
import { Checkbox } from "primereact/checkbox";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

import { Note, Chord as ChordType } from "@/lib";
import { PercussionPad } from "@/components/PercussionPad";
import { PianoKeyboard, PianoKeyboardRef } from "@/components/PianoKeyboard";
import { TextBeauty } from "@/components/TextBeauty";
import { TouchEvent } from "@/components/TouchEvent";

import { ChordItem, ProgressionVO } from "../ProgressionDesigner/share";
import { ChordPad } from "../ChordPad";
import { NoteList } from "../NoteList";

import "./index.scss";

export interface ProgressionItemProps {
  id: number;
  progression: ProgressionVO;
  pianoRef: RefObject<PianoKeyboardRef>;
  disabled?: boolean;
  showModeStepHint?: boolean;
  showChordTransformTools?: boolean;
  onInvertChord: (index: number) => void;
  onToggleOmitNote: (index: number, note: Note, omit: boolean) => void;
  onToggleOctaveChord: (index: number, octave: 0 | 8 | -8) => void;
  onToggleSelectChord: (index: number, selected: boolean) => void;
  onInsertChord: (index: number, chord: ChordType) => void;
  onInsertChordAt: (index: number) => void;
  onRemoveChord: (index: number) => void;
}

export function ProgressionItem(props: ProgressionItemProps) {
  const { progression, showModeStepHint } = props;
  const { chords, arrangement } = progression;

  const showHint =
    showModeStepHint && chords.every((chord) => !!chord.chord.mode());

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

  const showMode =
    current.chord.mode()!.name() !== previous?.chord.mode()!.name();

  return (
    <div
      className={classNames(
        "flex items-center gap-2 text-sm py-1 whitespace-nowrap"
      )}
    >
      {showMode && (
        <TextBeauty className="ml-3 border-l-2 border-transparent">
          {current.chord.mode()!.name({
            shortName: true,
            transformAccidental: true,
          })}
        </TextBeauty>
      )}
      <div className="flex-1 flex justify-center items-center gap-2">
        {!showMode && <div className="pl-[29%] border-b border-gray-200" />}
        <div>{current.chord.step()}</div>
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
    onInsertChordAt,
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

  const state = useReactive({
    showPredictionDialog: false,
  });

  const domRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<OverlayPanel>(null);

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
            "fa-solid fa-add mt-5 mx-1 p-1 text-sm border-2",
            "cursor-pointer text-gray-300 hover:text-gray-500",
            {
              "border-transparent": progression.insertIndex !== index,
              "border-orange-300 bg-orange-50 text-gray-500":
                progression.insertIndex === index,
            }
          )}
          onClick={(e) => {
            overlayRef.current?.toggle(e);
          }}
        />

        <OverlayPanel ref={overlayRef}>
          <div className="flex flex-col gap-2">
            <Button
              label="From Prediction"
              icon="fa-solid fa-wand-magic-sparkles"
              outlined
              disabled={!chord.mode()?.isMajorMinor()}
              onClick={() => {
                state.showPredictionDialog = true;
              }}
            />
            <Button
              label="From Table"
              icon="pi pi-table"
              outlined
              onClick={() => {
                onInsertChordAt(index);
                overlayRef.current?.hide();
              }}
            />
          </div>
        </OverlayPanel>

        <Dialog
          header="Select Chord"
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          blockScroll
          visible={state.showPredictionDialog}
          onHide={() => (state.showPredictionDialog = false)}
        >
          <ChordPredictionTable
            chord={chord.inverse(inversion)}
            onSelect={(chord) => {
              onInsertChord(index, chord);
              state.showPredictionDialog = false;
            }}
          />
        </Dialog>
      </div>
    </div>
  );
}

interface ChordPredictionTableProps {
  chord: ChordType;
  onSelect: (chord: ChordType) => void;
}

function ChordPredictionTable(props: ChordPredictionTableProps) {
  const { chord, onSelect } = props;

  const state = useReactive({
    selectedIndex: -1,
  });

  const pianoRef = useRef<PianoKeyboardRef>(null);

  const chords = useMemo(() => {
    return chord.resolveTo({ algorithm: "closely-related-modes" });
  }, [chord]);

  function onChoose(index: number) {
    state.selectedIndex = index === state.selectedIndex ? -1 : index;
  }

  function onConfirm() {
    if (state.selectedIndex === -1) {
      return;
    }
    onSelect(chords[state.selectedIndex]);
  }

  return (
    <div className="chordTable">
      {/* keyboard */}
      <PianoKeyboard
        ref={pianoRef}
        className="my-3 w-full border-2 border-transparent"
        startNote="C3"
        endNote="B4"
        showLabelFor={["c", "blacks"]}
        showHighlightNotesHint
      />

      {/* hint */}
      <div className="flex items-center gap-1 mb-4 text-sm">
        <span>Select a chord followed by:</span>
        <ChordPad
          className="border-2 border-[#3576cb]"
          chord={chord}
          pianoRef={pianoRef}
        />
      </div>

      {/* table */}
      <div className="text-sm  overflow-auto">
        <table>
          <thead>
            <tr>
              <th style={{}}></th>
              <th style={{ width: 160 }}>Mode</th>
              <th style={{ width: 70 }}>Step</th>
              <th style={{ width: 100 }}>Chord</th>
              <th style={{ width: 230 }}>Pitches</th>
            </tr>
          </thead>
          <tbody>
            {chords.map((item, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="cursor-pointer" onClick={() => onChoose(index)}>
                  <Checkbox
                    className="block"
                    checked={state.selectedIndex === index}
                  />
                </td>
                <td
                  className={classNames("px-2 cursor-pointer", {
                    "font-bold": chord.mode()!.is(item.mode()!),
                  })}
                  onClick={() => onChoose(index)}
                >
                  <TextBeauty>
                    {item.mode()!.name({ transformAccidental: true })}
                  </TextBeauty>
                </td>
                <td
                  className="px-2 cursor-pointer"
                  onClick={() => onChoose(index)}
                >
                  {item.step()}
                </td>
                <td className="">
                  <ChordPad chord={item} pianoRef={pianoRef} />
                </td>
                <td className="px-1">
                  <NoteList notes={item.notes()} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* button */}
      <div className="flex justify-end mt-4">
        <Button
          label="Add"
          size="small"
          icon="fa-solid fa-wand-magic-sparkles"
          className="px-4"
          disabled={state.selectedIndex === -1}
          onClick={onConfirm}
        />
      </div>
    </div>
  );
}
