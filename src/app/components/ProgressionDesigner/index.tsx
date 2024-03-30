"use client";
import React, { useRef } from "react";
import classNames from "classnames";
import { useMount, useReactive } from "ahooks";
import { Accordion, AccordionTab } from "primereact/accordion";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

import { Chord, Note, NoteArray } from "@/lib";
import { ee } from "@/utils/ee";
import { storage } from "@/utils/storage";
import { PianoKeyboard, PianoKeyboardRef } from "@/components/PianoKeyboard";
import { Sticky } from "@/components/Sticky";

import { ProgressionItem } from "../ProgressionItem";
import { ChordItem, Progression } from "./share";
import "./index.scss";

export interface ProgressionDesignerProps {
  className?: string;
}

export function ProgressionDesigner(props: ProgressionDesignerProps) {
  const { className } = props;

  const state = useReactive({
    loaded: false,
    isPin: false,
    isPlaying: { status: false, progression: null as Progression | null },
    current: 0,
    list: [] as Progression[],
  });

  useMount(load);

  const pianoRef = useRef<PianoKeyboardRef>(null);

  const currentProgression = state.list[state.current];

  ee.useEvent("ADD_CHORD", onAddOrReplaceChord);

  function save() {
    storage.progressions = state.list.map((item) => ({
      ...item,
      chords: item.chords.map((it) => ({
        ...it,
        chord: it.chord.noteNames(),
        omits: it.omits.names(),
      })),
    }));
  }

  function load() {
    const progressions = storage.progressions?.length
      ? storage.progressions
      : [{ name: "Progression 1", chords: [] }];

    state.list = progressions.map((item) => ({
      ...item,
      chords: item.chords.map((it) => ({
        chord: new Chord(it.chord),
        inversion: it.inversion || 0,
        omits: NoteArray.from(it.omits),
        octave: it.octave || 0,
        playing: false,
        replacing: false,
      })),
    }));

    state.current = storage.currentProgressionIndex || 0;
    state.loaded = true;
  }

  async function playChord(chord: ChordItem, duration = 600) {
    if (!pianoRef.current) {
      return;
    }

    const notes = chord.chord
      .inversion(chord.inversion)
      .notes()
      .withGroup(3, { omits: chord.omits, octave: chord.octave })
      .names({ transformAccidental: false });

    await pianoRef.current.attackRelease(notes, duration);
  }

  // events for <ProgressionList />

  function onTogglePin() {
    state.isPin = !state.isPin;
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
    });
    state.current = state.list.length - 1;
    save();
  }

  function onRemoveProgression(index: number) {
    state.list = state.list.filter((_, idx) => idx !== index);
    state.current = Math.max(0, index - 1);
    save();
  }

  // events for <ProgressionItem />

  function onChangeName(index: number) {
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
        progression.name = name;
        save();
      },
    });
  }

  async function onPlay(index: number) {
    if (state.isPlaying.status) {
      return;
    }

    const progression = state.list[index];

    state.current = index;
    state.isPlaying = { status: true, progression };

    for (const chord of progression.chords) {
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

  function onAddOrReplaceChord(chord: Chord) {
    const currentProgression = state.list[state.current];

    if (!currentProgression) {
      return;
    }

    const newChord: ChordItem = {
      chord,
      inversion: 0,
      omits: NoteArray.from([]),
      octave: 0,
      playing: false,
      replacing: false,
    };

    const replacingChordIndex = currentProgression.chords.findIndex(
      (item) => item.replacing
    );

    if (replacingChordIndex > -1) {
      newChord.replacing = true;
      currentProgression.chords[replacingChordIndex] = newChord;
      playChord(newChord);
    } else {
      currentProgression.chords.push(newChord);
    }

    save();
  }

  function onRemoveChord(index: number) {
    currentProgression.chords.splice(index, 1);
    save();
  }

  function onInvertChord(index: number) {
    const chord = currentProgression.chords[index];

    if (!chord) {
      return;
    }

    const newChord: ChordItem = {
      chord: chord.chord,
      omits: chord.omits,
      inversion: (chord.inversion + 1) % chord.chord.notes().count(),
      octave: chord.octave,
      playing: false,
      replacing: chord.replacing,
    };

    currentProgression.chords[index] = newChord;

    playChord(newChord);
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
  }

  function onToggleReplaceChord(index: number, replace: boolean) {
    const chord = currentProgression.chords[index];

    if (!chord) {
      return;
    }

    // reset all replace checkbox
    state.list.forEach((progression) => {
      progression.chords.forEach((chord) => {
        chord.replacing = false;
      });
    });

    chord.replacing = replace;
  }

  return (
    <Sticky
      disabled={!state.isPin}
      className={classNames(className, "z-10 py-4 pb-2 bg-white shadow-md")}
      offsetTop={50}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-base font-bold">Progression Designer</span>
        <i
          className={classNames(
            "fa-regular fa-thumbtack cursor-pointer",
            state.isPin ? "rotate-0" : "rotate-[45deg]"
          )}
          onClick={onTogglePin}
        />
      </div>

      <div className="flex justify-center">
        <PianoKeyboard
          ref={pianoRef}
          className="mb-4 w-[800px]"
          startNote="C3"
          endNote="B4"
          showLabelFor={["c", "blacks"]}
          enabledKeys={[]}
          showHighlightNotesHint
        />
      </div>

      <Accordion
        className=""
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
                      onChangeName(index);
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
                          "pi pi-play": !state.isPlaying.status,
                          "pi pi-pause": state.isPlaying.status,
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

                {/* remove icon */}
                {!state.isPlaying.status && (
                  <i
                    className="pi pi-trash p-1 cursor-pointer hover:bg-gray-300 active:bg-gray-400"
                    style={{ fontSize: "0.8rem" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveProgression(index);
                    }}
                  />
                )}
              </div>
            }
          >
            <ProgressionItem
              id={index}
              chords={item.chords}
              pianoRef={pianoRef}
              disabled={state.isPlaying.status}
              onInvertChord={onInvertChord}
              onToggleOmitNote={onToggleOmitNote}
              onToggleOctaveChord={onToggleOctaveChord}
              onToggleReplaceChord={onToggleReplaceChord}
              onRemoveChord={onRemoveChord}
            />
          </AccordionTab>
        ))}
      </Accordion>

      {state.loaded && (
        <div className={classNames("flex justify-center items-center mt-2")}>
          <Button
            label="Add Progression"
            size="small"
            icon="pi pi-plus"
            text
            onClick={onAddProgression}
          />
        </div>
      )}

      <ConfirmDialog />
    </Sticky>
  );
}
