"use client";
import React, { ReactNode, RefObject, useMemo } from "react";
import classNames from "classnames";

import { TextBeauty } from "@/components/TextBeauty";
import { PercussionPad } from "@/components/PercussionPad";
import { PianoKeyboardRef } from "@/components/PianoKeyboard";

import { Chord } from "@/lib";

export interface ChordPadProps {
  chord: Chord;
  pianoRef: RefObject<PianoKeyboardRef>;
  className?: string;
  active?: boolean;
  extra?: ReactNode;
}

export function ChordPad(props: ChordPadProps) {
  const { chord, pianoRef, className, active, extra } = props;

  const abbr = chord.toAbbr({ transformAccidental: true });
  const notes = useMemo(() => chord.notes().withGroup(3).names(), [chord]);

  return (
    <PercussionPad
      className={classNames(
        className,
        "px-2 py-1 flex items-center justify-between cursor-pointer",
        {
          "hover:bg-gray-100": !active,
          "bg-blue-400 text-white": active,
        }
      )}
      notes={notes}
      pianoRef={pianoRef}
    >
      <div className="inline-block px-1 border border-transparent">
        <TextBeauty>{abbr}</TextBeauty>
      </div>
      {extra}
    </PercussionPad>
  );
}
