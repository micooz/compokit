"use client";
import React, { useMemo, useRef } from "react";
import { Card } from "primereact/card";

import { Chord, ChordTypeEnum, Mode, ModeEnum } from "@/lib";
import { ee } from "@/utils/ee";
import { PianoKeyboard, PianoKeyboardRef } from "@/components/PianoKeyboard";
import { PercussionPad } from "@/components/PercussionPad";
import { TextBeauty } from "@/components/TextBeauty";
import { TouchEvent } from "@/components/TouchEvent";

import { NoteItem } from "../NoteItem";

import "./index.scss";

export interface ChordTableProps {
  keyNote: string;
  mode: ModeEnum;
  onRemove?: () => void;
}

export function ChordTable(props: ChordTableProps) {
  const { keyNote, mode, onRemove } = props;

  const pianoRef = useRef<PianoKeyboardRef>(null);

  const [modeIns, rows] = useMemo(() => {
    const modeIns = Mode.from(keyNote, mode);
    const rows: { step: number; triad: Chord; seventh: Chord }[] = [];

    for (let i = 1; i <= 7; i++) {
      const triad = modeIns.chord(i);
      const seventh = modeIns.chord(i, ChordTypeEnum.Seventh);

      rows.push({
        step: i,
        triad,
        seventh,
      });
    }

    return [modeIns, rows];
  }, [keyNote, mode]);

  const modeKeys = useMemo(() => {
    const arr = modeIns.notes();
    const notes = arr.withGroup(3).valueOf();

    const repeat = notes[0].clone();
    repeat.group = repeat.group! + 1;

    notes.push(repeat);

    return notes.map((note) => note.nameWithGroup());
  }, [modeIns]);

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
    ee.emit("ADD_CHORD", { chord, mode: modeIns.clone() });
  }

  // components

  function ModeTitle() {
    const name = modeIns.name({ transformAccidental: true });
    const notes = modeIns
      .notes()
      .names({ transformAccidental: true })
      .map((name, index, arr) => (
        <React.Fragment key={index}>
          <NoteItem>{name}</NoteItem>
          {index !== arr.length - 1 && ","}
        </React.Fragment>
      ));

    return (
      <div className="flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="flex items-center max-sm:flex-col max-sm:items-start">
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

  function ChordItem(props: { chord: Chord }) {
    const { chord } = props;

    const abbr = chord.toAbbr({ transformAccidental: true });
    const notes = useMemo(() => chord.notes().withGroup(3).names(), [chord]);

    return (
      <PercussionPad
        className="px-2 py-1 flex items-center justify-between"
        notes={notes}
        pianoRef={pianoRef}
      >
        <div className="inline-block px-1 border border-transparent">
          <TextBeauty>{abbr}</TextBeauty>
        </div>
        <TouchEvent onTouchStart={() => onAddChord(chord)}>
          <i
            className="pi pi-plus p-1 hover:bg-gray-300 active:bg-gray-400"
            style={{ fontSize: "0.8rem" }}
          />
        </TouchEvent>
      </PercussionPad>
    );
  }

  return (
    <Card className="chordTable relative select-none" title={<ModeTitle />}>
      <PianoKeyboard
        ref={pianoRef}
        className="mb-3 w-full"
        startNote="C3"
        endNote="B4"
        showLabelFor={["c"]}
        enabledKeys={modeKeys}
        dottedNotes={[modeKeys[0]]}
      />
      <div className="overflow-auto">
        <table>
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
                  <ChordItem chord={item.triad} />
                </td>
                <td className="hover:bg-gray-100 cursor-pointer">
                  <ChordItem chord={item.seventh} />
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
    </Card>
  );
}
