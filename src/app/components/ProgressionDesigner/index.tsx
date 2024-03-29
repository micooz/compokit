"use client";
import React, { useRef } from "react";
import classNames from "classnames";
import { useMount, useReactive } from "ahooks";
import { Accordion, AccordionTab } from "primereact/accordion";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import StickyBox from "react-sticky-box";

import { Chord, Note, NoteArray } from "@/lib";
import { ee } from "@/utils/ee";
import { storage } from "@/utils/storage";
import { sleep } from "@/utils/common";
import { PianoKeyboard, PianoKeyboardRef } from "@/components/PianoKeyboard";
import { ProgressionItem } from "../ProgressionItem";
import { Progression } from "./share";

import "./index.scss";

export interface ProgressionDesignerProps {
  className?: string;
}

export function ProgressionDesigner(props: ProgressionDesignerProps) {
  const { className } = props;

  const state = useReactive({
    loaded: false,
    isPin: true,
    isPlaying: { status: false, progression: null as Progression | null },
    current: 0,
    list: [] as Progression[],
  });

  useMount(load);

  const pianoRef = useRef<PianoKeyboardRef>(null);

  const currentProgression = state.list[state.current];

  ee.useEvent("ADD_CHORD", onAddChord);

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
        ...it,
        omits: NoteArray.from(it.omits),
        chord: new Chord(it.chord),
        playing: false,
      })),
    }));

    state.current = storage.activeProgressionIndex || 0;
    state.loaded = true;
  }

  // events for <ProgressionList />

  function onTogglePin() {
    state.isPin = !state.isPin;
  }

  function onTabChange(index: number) {
    state.current = index;
    storage.activeProgressionIndex = index;
  }

  function onAddProgression() {
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

  function onChangeName(progression: Progression) {
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

  async function onPlay(progression: Progression) {
    if (state.isPlaying.status) {
      return;
    }

    state.isPlaying = { status: true, progression };

    for (const item of progression.chords) {
      const keys = item.chord
        .notes()
        .omit(item.omits, { checkAccidental: true })
        .withGroup(3)
        .names({ transformAccidental: false });

      pianoRef.current?.attack(keys);
      item.playing = true;

      await sleep(940);
      pianoRef.current?.release();
      item.playing = false;

      // wait a little bit for the voice to sound cleaner.
      await sleep(60);

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

  function onAddChord(chord: Chord) {
    const progression = state.list[state.current];

    if (!progression) {
      return;
    }

    progression.chords.push({
      id: progression.chords.length,
      chord,
      omits: NoteArray.from([]),
      playing: false,
    });

    save();
  }

  function onRemoveChord(index: number) {
    currentProgression.chords.splice(index, 1);
    save();
  }

  function onInvertChord(index: number) {
    const item = currentProgression.chords[index];

    if (!item) {
      return;
    }

    currentProgression.chords[index] = {
      id: item.id,
      chord: item.chord.inversion(1),
      omits: item.omits,
      playing: false,
    };

    save();
  }

  function onToggleOmitNote(index: number, note: Note, omit: boolean) {
    const item = currentProgression.chords[index];

    if (!item) {
      return;
    }

    let newOmits = [...item.omits.valueOf()];

    if (omit) {
      newOmits.push(note);
    } else {
      newOmits = newOmits.filter((it) => !it.is(note));
    }

    if (newOmits.length === item.chord.notes().count()) {
      return;
    }

    item.omits = NoteArray.from(newOmits);
    save();
  }

  // function onSortChords(chords: ChordItem[]) {
  //   currentProgression.chords = chords;
  //   save();
  // }

  return (
    <StickyBox
      className={classNames("z-10 py-4 bg-white shadow-md", className)}
      style={{ position: state.isPin ? "sticky" : undefined }}
    >
      <div className="flex justify-between items-center mb-4">
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
              <div
                className="flex justify-between items-center select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  {/* title */}
                  <span
                    className="text-sm cursor-text"
                    onClick={() => onChangeName(item)}
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
                      onClick={() => {
                        state.isPlaying.status ? onPause() : onPlay(item);
                      }}
                    />
                  )}
                </div>

                {/* remove icon */}
                {!state.isPlaying.status && (
                  <i
                    className="pi pi-trash p-1 cursor-pointer hover:bg-gray-300 active:bg-gray-400"
                    style={{ fontSize: "0.8rem" }}
                    onClick={() => onRemoveProgression(index)}
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
              onInvert={onInvertChord}
              onOmitNote={onToggleOmitNote}
              onRemove={onRemoveChord}
              // onSort={onSortChords}
            />
          </AccordionTab>
        ))}
      </Accordion>

      {state.loaded && (
        <div
          className={classNames(
            "flex justify-center items-center -mt-[1px] border py-1 text-gray-600",
            "cursor-pointer bg-gray-100 active:bg-gray-200"
          )}
          onClick={onAddProgression}
        >
          <i className="pi pi-plus mr-2" style={{ fontSize: "0.6rem" }} />
          <span className="text-xs">Add Progression</span>
        </div>
      )}

      <ConfirmDialog />
    </StickyBox>
  );
}
