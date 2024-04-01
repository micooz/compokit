"use client";
import React, { useRef } from "react";
import classNames from "classnames";
import { useMount, useReactive } from "ahooks";
import { Accordion, AccordionTab } from "primereact/accordion";
import { confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { Skeleton } from "primereact/skeleton";

import { Chord, Mode, Note, NoteArray } from "@/lib";
import { ee } from "@/utils/ee";
import { storage } from "@/utils/storage";
import { PianoKeyboard, PianoKeyboardRef } from "@/components/PianoKeyboard";
import { Sticky } from "@/components/Sticky";

import { ProgressionItem } from "../ProgressionItem";
import { ChordItem, ProgressionVO } from "./share";
import type { Progression } from "@/typings/storage";
import "./index.scss";

export interface ProgressionDesignerProps {
  className?: string;
}

export function ProgressionDesigner(props: ProgressionDesignerProps) {
  const { className } = props;

  const state = useReactive({
    loaded: false,
    isPin: true,
    isPlaying: { status: false, progression: null as ProgressionVO | null },
    current: 0,
    list: [] as ProgressionVO[],
    showModeStepHint: false,
    showChordTransformTools: false,
  });

  useMount(load);

  const pianoRef = useRef<PianoKeyboardRef>(null);

  const currentProgression = state.list[state.current];

  ee.useEvent("ADD_CHORD", onAddOrReplaceChord);

  function load() {
    // load progression list
    let progressions: Progression[] = [];

    if (storage.progressions?.length) {
      progressions = storage.progressions;
    } else {
      // add default item
      progressions = [
        { name: "Progression 1", chords: [], arrangement: "horizontal" },
      ];
    }

    state.list = progressions.map((item) => ({
      name: item.name,
      chords: item.chords.map((it) => ({
        chord: new Chord(it.chord),
        step: it.step,
        inversion: it.inversion || 0,
        omits: NoteArray.from(it.omits),
        octave: it.octave || 0,
        playing: false,
        selected: false,
        mode: it.mode ? Mode.from(it.mode.key, it.mode.type!) : undefined,
      })),
      arrangement: item.arrangement || "horizontal",
    }));

    // load other config
    state.current = storage.currentProgressionIndex || 0;
    state.isPin = storage.pinProgressionDesigner ?? true;
    state.showModeStepHint = storage.showModeStepHint ?? false;
    state.showChordTransformTools = storage.showChordTransformTools ?? false;

    state.loaded = true;
  }

  function save() {
    storage.progressions = state.list.map((item) => ({
      ...item,
      chords: item.chords.map((it) => ({
        ...it,
        chord: it.chord.noteNames(),
        omits: it.omits.names(),
        mode: it.mode
          ? {
              key: it.mode.key().name(),
              type: it.mode.type()!,
            }
          : undefined,
      })),
    }));
  }

  async function playChord(chord: ChordItem, duration = 600) {
    if (!pianoRef.current) {
      return;
    }

    const notes = chord.chord
      .inverse(chord.inversion)
      .notes()
      .withGroup(3, { omits: chord.omits, octave: chord.octave })
      .names();

    await pianoRef.current.attackRelease(notes, duration);
  }

  // events for <ProgressionList />

  function onToggleShowModeStepHint(e: CheckboxChangeEvent) {
    state.showModeStepHint = !!e.checked;
    storage.showModeStepHint = state.showModeStepHint;
  }

  function onToggleShowChordTransformTools(e: CheckboxChangeEvent) {
    state.showChordTransformTools = !!e.checked;
    storage.showChordTransformTools = state.showChordTransformTools;
  }

  function onTogglePin() {
    state.isPin = !state.isPin;
    storage.pinProgressionDesigner = state.isPin;
  }

  function onTabChange(index: number) {
    if (state.isPlaying.status) {
      return;
    }
    state.current = index;
    storage.currentProgressionIndex = index;
  }

  function onAddProgression() {
    if (state.isPlaying.status) {
      return;
    }
    state.list.push({
      name: `Progression ${state.list.length + 1}`,
      chords: [],
      arrangement: "horizontal",
    });
    state.current = state.list.length - 1;
    save();
  }

  function onToggleArrangement(index: number) {
    const progression = state.list[index];

    if (!progression) {
      return;
    }

    progression.arrangement =
      progression.arrangement === "horizontal" ? "vertical" : "horizontal";

    save();
  }

  function onRemoveProgression(index: number) {
    const progression = state.list[index];

    if (!progression) {
      return;
    }

    confirmDialog({
      header: "Remove Progression",
      message: (
        <div>
          Are you sure to remove:
          <span className="inline-block mx-2 font-semibold">
            {progression.name}
          </span>
          ?
        </div>
      ),
      accept: () => {
        state.list = state.list.filter((_, idx) => idx !== index);
        state.current = Math.max(0, index - 1);
        save();
      },
    });
  }

  // events for <ProgressionItem />

  function onRename(index: number) {
    if (state.isPlaying.status) {
      return;
    }

    const progression = state.list[index];

    let name = progression.name;

    confirmDialog({
      header: "Change Name",
      icon: <i className="fa-solid fa-pencil" style={{ fontSize: "1.4rem" }} />,
      message: (
        <div className="my-2">
          <InputText
            defaultValue={progression.name}
            onChange={(e) => {
              name = e.target.value;
            }}
          />
        </div>
      ),
      accept: () => {
        progression.name = name.trim();
        save();
      },
    });
  }

  async function onPlay(index: number) {
    if (state.isPlaying.status) {
      return;
    }

    const progression = state.list[index];
    let { chords } = progression;

    state.isPlaying = { status: true, progression };
    state.current = index;

    // play from selected chord
    const fromIndex = progression.chords.findIndex((chord) => chord.selected);

    if (fromIndex > -1) {
      chords = chords.slice(Math.max(fromIndex, 0));
    }

    for (const chord of chords) {
      chord.playing = true;
      await playChord(chord, 1000);
      chord.playing = false;

      // set by onPause()
      if (state.isPlaying.status === false) {
        pianoRef.current?.release();
        break;
      }
    }

    state.isPlaying = { status: false, progression: null };
  }

  async function onPause() {
    state.isPlaying = { status: false, progression: null };
  }

  function onAddOrReplaceChord(args: {
    chord: Chord;
    step: number;
    mode: Mode;
  }) {
    const { chord, step, mode } = args;
    const currentProgression = state.list[state.current];

    if (!currentProgression) {
      return;
    }

    const newChord: ChordItem = {
      chord,
      step,
      inversion: 0,
      omits: NoteArray.from([]),
      octave: 0,
      playing: false,
      selected: false,
      mode,
    };

    const selectedChordIndex = currentProgression.chords.findIndex(
      (item) => item.selected
    );

    if (selectedChordIndex > -1) {
      newChord.selected = true;
      currentProgression.chords[selectedChordIndex] = newChord;
      playChord(newChord);
    } else {
      currentProgression.chords.push(newChord);
    }

    save();
  }

  function onRemoveChord(index: number) {
    const deleted = currentProgression.chords.splice(index, 1);

    if (deleted[0].selected) {
      ee.emit("SELECT_CHORD", undefined);
    }

    save();
  }

  function onInvertChord(index: number) {
    const chord = currentProgression.chords[index];

    if (!chord) {
      return;
    }

    chord.inversion = (chord.inversion + 1) % chord.chord.notes().count();

    playChord(chord);
    save();
  }

  function onToggleOmitNote(index: number, note: Note, omit: boolean) {
    const chord = currentProgression.chords[index];

    if (!chord) {
      return;
    }

    let newOmits = [...chord.omits.valueOf()];

    if (omit) {
      newOmits.push(note);
    } else {
      newOmits = newOmits.filter((it) => !it.is(note));
    }

    if (newOmits.length === chord.chord.notes().count()) {
      return;
    }

    chord.omits = NoteArray.from(newOmits);

    playChord(chord);
    save();
  }

  function onToggleOctaveChord(index: number, octave: 0 | 8 | -8) {
    const chord = currentProgression.chords[index];

    if (!chord) {
      return;
    }

    chord.octave = chord.octave === octave ? 0 : octave;
    playChord(chord);
    save();
  }

  function onToggleSelectChord(index: number, selected: boolean) {
    const chord = currentProgression.chords[index];

    if (!chord) {
      return;
    }

    // reset all checkbox
    state.list.forEach((progression) => {
      progression.chords.forEach((chord) => {
        chord.selected = false;
      });
    });

    chord.selected = selected;

    ee.emit("SELECT_CHORD", selected ? chord.chord : undefined);
  }

  return (
    <Sticky
      disabled={!state.isPin}
      className={classNames(className, "z-20 pb-2 bg-white max-xl:shadow-md")}
      offsetTop={50}
    >
      {/* title & pin */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-base font-bold border-l-4 pl-2 border-[#1174c0]">
          Progression Designer
        </span>

        <i
          className={classNames(
            "fa-regular fa-thumbtack cursor-pointer",
            state.isPin ? "rotate-0" : "rotate-[45deg]"
          )}
          onClick={onTogglePin}
        />
      </div>

      {/* keyboard */}
      <div className="flex justify-center">
        <PianoKeyboard
          ref={pianoRef}
          className="mb-4 w-full max-w-[44rem]"
          startNote="C3"
          endNote="B4"
          showLabelFor={["c", "blacks"]}
          showHighlightNotesHint
        />
      </div>

      {/* options */}
      <div className="py-2 flex gap-4 whitespace-nowrap">
        <div className="flex items-center">
          <Checkbox
            inputId="showModeStepHint"
            onChange={onToggleShowModeStepHint}
            checked={state.showModeStepHint}
          />
          <label
            htmlFor="showModeStepHint"
            className="text-xs pl-2 cursor-pointer"
          >
            Show Mode/Step Hint
          </label>
        </div>

        <div className="flex items-center">
          <Checkbox
            inputId="showChordTransformTools"
            onChange={onToggleShowChordTransformTools}
            checked={state.showChordTransformTools}
          />
          <label
            htmlFor="showChordTransformTools"
            className="text-xs pl-2 cursor-pointer"
          >
            Show Chord Tools
          </label>
        </div>
      </div>

      {/* progression list */}
      {!state.loaded ? (
        <div className="flex flex-col gap-2">
          <Skeleton width="100%" height="37px" />
          <Skeleton width="70%" height="24px" />
          <Skeleton width="80%" height="14px" />
        </div>
      ) : (
        <React.Fragment>
          <Accordion
            className="mt-2"
            // multiple
            activeIndex={state.current}
            onTabChange={(e) => onTabChange(e.index as number)}
          >
            {state.list.map((item, index) => (
              <AccordionTab
                key={index}
                className="flex items-center"
                header={
                  <div className="flex justify-between items-center select-none">
                    <div className="flex items-center gap-2">
                      {/* title */}
                      <span
                        className="text-sm cursor-text"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRename(index);
                        }}
                      >
                        {item.name}
                      </span>

                      {/* play icon */}
                      {(state.isPlaying.status === false ||
                        state.isPlaying.progression?.name === item.name) && (
                        <i
                          className={classNames(
                            "p-1 cursor-pointer hover:bg-gray-300 active:bg-gray-400",
                            {
                              "pi pi-play-circle": !state.isPlaying.status,
                              "pi pi-pause-circle": state.isPlaying.status,
                            }
                          )}
                          style={{ fontSize: "0.8rem" }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            state.isPlaying.status ? onPause() : onPlay(index);
                          }}
                        />
                      )}
                    </div>

                    {/* icons */}
                    <div className="flex items-center gap-1">
                      <i
                        className={classNames("pi pi-bars p-1 cursor-pointer", {
                          "bg-[#3a7bd0] text-white":
                            item.arrangement === "vertical",
                        })}
                        style={{ fontSize: "0.8rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onToggleArrangement(index);
                        }}
                      />
                      {!state.isPlaying.status && (
                        <i
                          className="pi pi-trash p-1 cursor-pointer hover:bg-gray-300 active:bg-gray-400"
                          style={{ fontSize: "0.8rem" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onRemoveProgression(index);
                          }}
                        />
                      )}
                    </div>
                  </div>
                }
              >
                <ProgressionItem
                  id={index}
                  progression={item}
                  pianoRef={pianoRef}
                  disabled={state.isPlaying.status}
                  showModeStepHint={state.showModeStepHint}
                  showChordTransformTools={state.showChordTransformTools}
                  onInvertChord={onInvertChord}
                  onToggleOmitNote={onToggleOmitNote}
                  onToggleOctaveChord={onToggleOctaveChord}
                  onToggleSelectChord={onToggleSelectChord}
                  onRemoveChord={onRemoveChord}
                />
              </AccordionTab>
            ))}
          </Accordion>

          {/* add button */}
          <div className={classNames("flex justify-center items-center mt-2")}>
            <Button
              label="Add Progression"
              size="small"
              icon="pi pi-plus"
              text
              onClick={onAddProgression}
            />
          </div>
        </React.Fragment>
      )}
    </Sticky>
  );
}
