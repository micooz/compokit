"use client";
import React, { useImperativeHandle, useMemo, useRef } from "react";
import classNames from "classnames";
import { useReactive, useSize } from "ahooks";
import { AspectRatio } from "react-aspect-ratio";
import "react-aspect-ratio/aspect-ratio.css";

import { Note, range } from "@/lib";
import { sleep } from "@/utils/common";
import { toneUtil } from "@/utils/tone";

import { TextBeauty } from "../TextBeauty";
import { TouchEvent } from "../TouchEvent";
import "./index.scss";

export interface PianoKeyboardProps {
  className?: string;
  startNote?: string;
  endNote?: string;
  showLabelFor?: ("c" | "blacks" | "whites")[];
  showHighlightNotesHint?: boolean;
  enabledKeys?: string[];
  dottedNotes?: string[];
}

export interface PianoKeyboardRef {
  mouseHover: (keys: string[]) => void;
  mouseLeave: () => void;
  attack: (keys: string[]) => Promise<void>;
  attackRelease: (keys: string[], duration: number) => Promise<void>;
  attackOneByOne: (keys: string[], interval: number) => Promise<void>;
  release: () => Promise<void>;
  isPlaying: () => boolean;
}

export const PianoKeyboard = React.forwardRef<
  PianoKeyboardRef,
  PianoKeyboardProps
>(function PianoKeyboard(props, ref) {
  const {
    className,
    startNote = "C4",
    endNote = "B5",
    showLabelFor = ["c"],
    showHighlightNotesHint = false,
    enabledKeys = [],
    dottedNotes = [],
  } = props;

  const boxRef = useRef<HTMLDivElement>(null);
  const pianoPlayingRef = useRef(false);
  const lastPlayedNotesRef = useRef<string[]>([]);

  const state = useReactive({
    hoverNotes: [] as string[],
    playingNotes: [] as string[],
    lastPlayedNotes: [] as string[],
  });

  const collection = useMemo(
    () => range(startNote, endNote, "both"),
    [startNote, endNote]
  );

  const availableKeys = useMemo(() => {
    if (enabledKeys.length > 0) {
      return enabledKeys.map((key) => Note.from(key));
    }
    return collection.map((item) => item.valueOf()).flat();
  }, [enabledKeys, collection]);

  const dottedKeys = useMemo(() => {
    return dottedNotes.map((note) => Note.from(note));
  }, [dottedNotes]);

  useImperativeHandle(ref, () => ({
    mouseHover,
    mouseLeave,
    attack,
    attackRelease,
    attackOneByOne,
    release,
    isPlaying,
  }));

  // methods

  function mouseHover(keys: string[]) {
    state.hoverNotes = keys;
  }

  function mouseLeave() {
    state.hoverNotes = [];
  }

  async function attack(keys: string[]) {
    if (pianoPlayingRef.current) {
      return;
    }
    await toneUtil.triggerAttack(keys);
    state.playingNotes = keys;
    lastPlayedNotesRef.current = keys;
  }

  async function attackRelease(keys: string[], duration: number) {
    if (pianoPlayingRef.current) {
      return;
    }
    await toneUtil.triggerAttackRelease(keys, duration / 1000);
    state.playingNotes = keys;
    lastPlayedNotesRef.current = keys;

    await sleep(duration);
    state.lastPlayedNotes = lastPlayedNotesRef.current;
    state.playingNotes = [];
  }

  async function attackOneByOne(keys: string[], interval: number) {
    if (pianoPlayingRef.current) {
      return;
    }

    pianoPlayingRef.current = true;
    state.lastPlayedNotes = [];

    for (const note of keys) {
      toneUtil.triggerAttackRelease(note, interval / 1000);
      state.playingNotes = [note];
      await sleep(interval);
    }

    state.playingNotes = [];
    pianoPlayingRef.current = false;
  }

  async function release() {
    if (pianoPlayingRef.current) {
      return;
    }
    await toneUtil.releaseAll();

    state.lastPlayedNotes = lastPlayedNotesRef.current;
    state.playingNotes = [];
  }

  function isPlaying() {
    return pianoPlayingRef.current;
  }

  // events

  function onPressNote(note: string | [string, string]) {
    if (typeof note === "string") {
      return attack([note]);
    }

    const [noteA, noteB] = note;

    let key = noteA;

    // determine which note should be attack
    for (const note of availableKeys) {
      if (note.isSharp()) {
        key = noteA;
        break;
      }
      if (note.isFlat()) {
        key = noteB;
        break;
      }
    }

    return attack([key]);
  }

  function onRelease() {
    return release();
  }

  // components

  function HighlightHint() {
    const notes = state.playingNotes.map((note) => Note.from(note));
    const hint = notes
      .map((note) => note.nameWithGroup({ transformAccidental: true }))
      .join(", ");

    return (
      <div className="mb-1 text-sm">
        Notes:&nbsp;
        {notes.length > 0 ? <TextBeauty>{hint}</TextBeauty> : "<none>"}
      </div>
    );
  }

  function KeyDot() {
    return (
      <div className="absolute left-1/2 -ml-[3px] bottom-[10%] w-[6px] h-[6px] rounded-full bg-orange-500" />
    );
  }

  function renderWhiteKey({ note, index }: { note: Note; index: number }) {
    if (!note.isNature()) {
      return null;
    }

    const nextKeys = collection[index + 1]?.valueOf() || [];

    const disabled = !availableKeys.find((key) => key.is(note));

    const noteWithGroup = note.nameWithGroup();

    const playing = state.playingNotes.includes(noteWithGroup);
    const hover = state.hoverNotes.includes(noteWithGroup);
    const dim = state.lastPlayedNotes.includes(noteWithGroup);

    const dotted = dottedKeys.find((key) => key.is(note));

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const showLabel = useMemo(() => {
      if (dotted) {
        return false;
      }
      if (showLabelFor.includes("whites")) {
        return true;
      }
      if (note.is("C") && showLabelFor.includes("c")) {
        return true;
      }
      return false;
    }, [dotted, note]);

    return (
      <TouchEvent
        className={classNames(
          "whiteKey",
          "relative",
          "flex items-end flex-1 border-[2px] border-black -ml-[2px]",
          "text-black bg-white",
          disabled && "disabled",
          playing && "playing",
          hover && "hover",
          dim && "dim"
        )}
        onTouchStart={() => {
          if (disabled) {
            return;
          }
          onPressNote(note.nameWithGroup());
        }}
        onTouchEnd={onRelease}
      >
        <div className="pl-2">
          {showLabel && <TextBeauty>{note.nameWithGroup()}</TextBeauty>}
        </div>

        {dotted && <KeyDot />}

        {renderBlackKey({ notes: nextKeys })}
      </TouchEvent>
    );
  }

  function renderBlackKey({ notes }: { notes: Note[] }) {
    const [nextA, nextB] = notes;

    if (!nextA || nextA.isNature()) {
      return null;
    }

    const disabled = !availableKeys.find(
      (key) => key.is(nextA) || key.is(nextB)
    );

    const nextAWithGroup = nextA.nameWithGroup();
    const nextBWithGroup = nextB.nameWithGroup();

    const playing =
      state.playingNotes.includes(nextAWithGroup) ||
      state.playingNotes.includes(nextBWithGroup);

    const hover =
      state.hoverNotes.includes(nextAWithGroup) ||
      state.hoverNotes.includes(nextBWithGroup);

    const dim =
      state.lastPlayedNotes.includes(nextAWithGroup) ||
      state.lastPlayedNotes.includes(nextBWithGroup);

    const dotted = dottedKeys.find((key) => key.is(nextA) || key.is(nextB));

    return (
      <TouchEvent
        className={classNames(
          "blackKey absolute top-0 w-[65.21%] h-[66%] z-[1]",
          {
            "left-[58.00%]": nextA.is("C#") || nextB.is("Db"),
            "left-[81.00%]": nextA.is("D#") || nextB.is("Eb"),
            "left-[54.00%]": nextA.is("F#") || nextB.is("Gb"),
            "left-[68.00%]": nextA.is("G#") || nextB.is("Ab"),
            "left-[83.00%]": nextA.is("A#") || nextB.is("Bb"),
          },
          "flex items-end justify-center flex-1",
          "bg-black text-white",
          "rounded-bl-[4px] rounded-br-[4px]",
          disabled && "disabled",
          playing && "playing",
          hover && "hover",
          dim && "dim"
        )}
        onTouchStart={() => {
          if (disabled) {
            return;
          }
          onPressNote([nextA.nameWithGroup(), nextB.nameWithGroup()]);
        }}
        onTouchEnd={onRelease}
      >
        {showLabelFor.includes("blacks") && !dotted && (
          <div className="flex flex-col items-center mb-2">
            <TextBeauty>
              {nextA.nameWithGroup({ transformAccidental: true })}
            </TextBeauty>
            <TextBeauty>
              {nextB.nameWithGroup({ transformAccidental: true })}
            </TextBeauty>
          </div>
        )}
        {dotted && <KeyDot />}
      </TouchEvent>
    );
  }

  const boxWidth = useSize(boxRef)?.width || 0;

  const textResponsiveClassNames = useMemo(
    () =>
      classNames("select-none font-semibold", {
        "text-[24px]": boxWidth > 1600,
        "text-[20px]": boxWidth > 1200 && boxWidth <= 1600,
        "text-[16px]": boxWidth > 800 && boxWidth <= 1200,
        "text-[12px]": boxWidth > 600 && boxWidth <= 800,
        "text-[0px]": boxWidth <= 600,
      }),
    [boxWidth]
  );

  return (
    <div className={classNames("pianoKeyboard", className)}>
      {showHighlightNotesHint && <HighlightHint />}

      <AspectRatio ratio="5">
        <div
          ref={boxRef}
          className={classNames("relative flex", textResponsiveClassNames)}
        >
          {collection.map((notes, index) => (
            <React.Fragment key={index}>
              {renderWhiteKey({ note: notes.get(0), index })}
            </React.Fragment>
          ))}
        </div>
      </AspectRatio>
    </div>
  );
});
