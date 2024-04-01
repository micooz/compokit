"use client";
import React, { useMemo, useRef } from "react";
import classNames from "classnames";

import { Chord, ChordTypeEnum, Mode } from "@/lib";
import { ee } from "@/utils/ee";
import { PianoKeyboard, PianoKeyboardRef } from "@/components/PianoKeyboard";
import { PercussionPad } from "@/components/PercussionPad";
import { TextBeauty } from "@/components/TextBeauty";
import { TouchEvent } from "@/components/TouchEvent";

import { NoteItem } from "../NoteItem";

import "./index.scss";

export interface ChordTableProps {
  mode: Mode;
  selectedChord?: Chord;
  onRemove?: () => void;
}

export function ChordTable(props: ChordTableProps) {
  const { mode, selectedChord, onRemove } = props;

  const pianoRef = useRef<PianoKeyboardRef>(null);

  const rows = useMemo(() => {
    const rows: { step: number; triad: Chord; seventh: Chord }[] = [];

    for (let i = 1; i <= 7; i++) {
      const triad = mode.chord(i);
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

  function onAddChord(chord: Chord, step: number) {
    ee.emit("ADD_CHORD", { chord, step, mode: mode.clone() });
  }

  // components

  function ModeTitle() {
    const name = mode.name({ transformAccidental: true });
    const notes = mode
      .notes()
      .names({ transformAccidental: true })
      .map((name, index, arr) => (
        <React.Fragment key={index}>
          <NoteItem>{name}</NoteItem>
          {index !== arr.length - 1 && ","}
        </React.Fragment>
      ));

    return (
      <div className="flex flex-col justify-between pb-2">
        <div className="flex justify-between items-center font-semibold">
          <div className="flex items-center whitespace-nowrap max-sm:flex-col max-sm:items-start">
            <div className="flex items-center">
              <i
                className="dragHandle pi pi-bars cursor-grab mr-3"
                style={{ fontSize: "1rem" }}
              />
              <div className="flex gap-2 items-center">
                <TextBeauty className="text-base text-nowrap">
                  {name}
                </TextBeauty>
                <i
                  className="pi pi-play cursor-pointer"
                  style={{ fontSize: "0.8rem" }}
                  onClick={onPlayScale}
                />
              </div>
            </div>

            <div className="text-sm font-normal ml-2 text-nowrap max-sm:-ml-2">
              {notes}
            </div>
          </div>

          <div className="flex gap-2">
            <i
              className="pi pi-trash cursor-pointer"
              style={{ fontSize: "1rem" }}
              onClick={onRemove}
            />
          </div>
        </div>
      </div>
    );
  }

  function ChordItem(props: { chord: Chord; step: number }) {
    const { chord, step } = props;

    const abbr = chord.toAbbr({ transformAccidental: true });
    const notes = useMemo(() => chord.notes().withGroup(3).names(), [chord]);

    return (
      <PercussionPad
        className={classNames("px-2 py-1 flex items-center justify-between", {
          "bg-blue-300": selectedChord?.is(chord),
        })}
        notes={notes}
        pianoRef={pianoRef}
      >
        <div className="inline-block px-1 border border-transparent">
          <TextBeauty>{abbr}</TextBeauty>
        </div>
        <TouchEvent onTouchStart={() => onAddChord(chord, step)}>
          <i
            className={classNames("p-1 hover:bg-gray-300 active:bg-gray-400", {
              "pi pi-clone": !!selectedChord,
              "pi pi-plus": !selectedChord,
            })}
            style={{ fontSize: "0.8rem" }}
          />
        </TouchEvent>
      </PercussionPad>
    );
  }

  return (
    <div className="chordTable relative select-none overflow-auto p-4 border shadow-sm">
      {/* title */}
      <ModeTitle />

      {/* keyboard */}
      <PianoKeyboard
        ref={pianoRef}
        className="mb-3 w-full"
        startNote="C3"
        endNote="B4"
        showLabelFor={["c"]}
        enabledKeys={modeKeys}
        dottedNotes={[modeKeys[0]]}
      />

      {/* table */}
      <div className="overflow-auto">
        <table className="text-sm">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Step</th>
              <th style={{ width: 200 }}>Triad</th>
              <th style={{ width: 260 }}>Seventh Chord</th>
              <th style={{ width: 260 }}>Tones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.step}>
                <td className="">{item.step}</td>
                <td className="hover:bg-gray-100 cursor-pointer">
                  <ChordItem chord={item.triad} step={item.step} />
                </td>
                <td className="hover:bg-gray-100 cursor-pointer">
                  <ChordItem chord={item.seventh} step={item.step} />
                </td>
                <td className="px-2">
                  {item.seventh
                    .notes()
                    .valueOf()
                    .map((note, index, arr) => (
                      <React.Fragment key={index}>
                        <NoteItem>
                          {note.name({ transformAccidental: true })}
                        </NoteItem>
                        {index !== arr.length - 1 && ","}
                      </React.Fragment>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
