"use client";
import React, { useMemo, useRef } from "react";
import classNames from "classnames";
import { useReactive } from "ahooks";

import { Chord, ChordTypeEnum, Mode } from "@/lib";
import { ee } from "@/utils/ee";
import { PianoKeyboard, PianoKeyboardRef } from "@/components/PianoKeyboard";
import { TextBeauty } from "@/components/TextBeauty";
import { TouchEvent } from "@/components/TouchEvent";

import { ChordPad } from "../ChordPad";
import { NoteList } from "../NoteList";

import "./index.scss";

export interface ChordTableProps {
  mode: Mode;
  selectedChord?: Chord;
  onRemove?: () => void;
}

export function ChordTable(props: ChordTableProps) {
  const { mode, selectedChord, onRemove } = props;

  const state = useReactive({
    isInserting: false,
    isSelected: false,
  });

  const pianoRef = useRef<PianoKeyboardRef>(null);

  const rows = useMemo(() => {
    const rows: { step: number; triad: Chord; seventh: Chord }[] = [];

    for (let i = 1; i <= mode.notes().count(); i++) {
      const triad = mode.chord(i, ChordTypeEnum.Triad);
      const seventh = mode.chord(i, ChordTypeEnum.Seventh);

      rows.push({
        step: i,
        triad,
        seventh,
      });
    }

    return rows;
  }, [mode]);

  const modeKeys = useMemo(() => {
    const arr = mode.notes();
    const notes = arr.withGroup(3).valueOf();

    const repeat = notes[0].clone();
    repeat.group = repeat.group! + 1;

    notes.push(repeat);

    return notes.map((note) => note.nameWithGroup());
  }, [mode]);

  // events

  ee.useEvent("INSERT_CHORD", (insert) => {
    state.isInserting = insert;
  });

  ee.useEvent("SELECT_CHORD", (selected) => {
    state.isSelected = !!selected;
  });

  // methods

  async function onPlayScale() {
    if (!pianoRef.current) {
      return;
    }

    await pianoRef.current.attackOneByOne([...modeKeys], 200);

    const reversedModeKeys = [...modeKeys].reverse();
    reversedModeKeys.shift();
    await pianoRef.current.attackOneByOne(reversedModeKeys, 200);
  }

  function onAddChord(chord: Chord) {
    ee.emit("ADD_CHORD", chord);
  }

  // components

  function ModeTitle() {
    const name = mode.name({ transformAccidental: true });

    return (
      <div className="flex flex-col justify-between pb-2">
        <div className="flex flex-col whitespace-nowrap">
          <div className="flex justify-between">
            <div className="flex items-center">
              <i
                className="dragHandle pi pi-bars cursor-grab mr-3"
                style={{ fontSize: "1rem" }}
              />
              <TextBeauty className="text-base text-nowrap font-semibold">
                {name}
              </TextBeauty>
            </div>
            <i
              className="pi pi-trash cursor-pointer"
              style={{ fontSize: "1rem" }}
              onClick={onRemove}
            />
          </div>

          <div className="flex items-center">
            <i
              className="pi pi-play cursor-pointer"
              style={{ fontSize: "0.8rem" }}
              onClick={onPlayScale}
            />
            <NoteList
              className="text-sm font-normal text-nowrap"
              notes={mode.notes()}
            />
          </div>
        </div>
      </div>
    );
  }

  function ChordItem(props: { chord: Chord }) {
    const { chord } = props;
    const showCloneIcon = !!selectedChord; // || insertChord;

    return (
      <ChordPad
        chord={chord}
        pianoRef={pianoRef}
        active={selectedChord?.is(chord)}
        extra={
          <TouchEvent onTouchStart={() => onAddChord(chord)}>
            <i
              className={classNames(
                "p-1 hover:bg-gray-300 active:bg-gray-400",
                {
                  "pi pi-clone": showCloneIcon,
                  "pi pi-plus": !showCloneIcon,
                }
              )}
              style={{ fontSize: "0.8rem" }}
            />
          </TouchEvent>
        }
      />
    );
  }

  const isTableHighlight = state.isInserting || state.isSelected;

  return (
    <div className="chordTable relative select-none overflow-auto p-4 border shadow-sm">
      {/* title */}
      <ModeTitle />

      {/* keyboard */}
      <PianoKeyboard
        ref={pianoRef}
        className="mb-3 w-full border-2 border-transparent"
        startNote="C3"
        endNote="B4"
        showLabelFor={["c"]}
        enabledKeys={modeKeys}
        dottedNotes={[modeKeys[0]]}
      />

      {/* table */}
      <div
        className={classNames("overflow-auto border-2", {
          "border-orange-400": isTableHighlight,
          "border-transparent": !isTableHighlight,
        })}
      >
        <table className="text-sm">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Step</th>
              <th style={{ width: 200 }}>Triad</th>
              <th style={{ width: 260 }}>Seventh Chord</th>
              <th style={{ width: 260 }}>Pitches</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.step}>
                <td className="">{item.step}</td>
                <td className="">
                  <ChordItem chord={item.triad} />
                </td>
                <td className="">
                  <ChordItem chord={item.seventh} />
                </td>
                <td className="px-2">
                  <NoteList notes={item.seventh.notes()} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
