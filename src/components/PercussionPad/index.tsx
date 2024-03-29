"use client";
import React, { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useReactive } from "ahooks";

import { NoteArray, NoteEnum } from "@/lib";
import { PianoKeyboardRef } from "../PianoKeyboard";
import { TouchEvent } from "../TouchEvent";

export interface PercussionPadRef {
  highlight: () => void;
}

export interface PercussionPadProps {
  className?: string;
  pianoRef: React.RefObject<PianoKeyboardRef>;
  disabled?: boolean;
  notes: string[];
  omits?: string[];
  autoGroup?: boolean;
  active?: boolean;
  activeBgColor?: string;
  activeFgColor?: string;
  children: React.ReactNode;
}

export const PercussionPad = React.forwardRef<
  PercussionPadRef,
  PercussionPadProps
>(function PercussionPad(props, ref) {
  const {
    className,
    pianoRef,
    disabled,
    notes,
    omits = [],
    autoGroup = false,
    active = false,
    activeBgColor = "#3a7bd0",
    activeFgColor = "#ffffff",
    children,
  } = props;

  const state = useReactive({
    pressed: false,
  });

  const domRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (active) {
  //     domRef.current?.scrollIntoView(false);
  //   }
  // }, [active]);

  const notesWithGroup = useMemo(() => {
    let arr = NoteArray.from(notes);
    let group = 3;

    if (autoGroup) {
      const first = arr.get(0);
      const size = arr.valueOf().length;

      // triad
      if (size <= 3 && first.index <= NoteEnum.E) {
        group = 4;
      }
      // seventh
      if (size <= 4 && first.index === NoteEnum.C) {
        group = 4;
      }
    }

    arr = arr.withGroup(group);

    if (omits.length > 0) {
      arr = arr.omit(NoteArray.from(omits), {
        checkAccidental: true,
      });
    }

    return arr.names({ transformAccidental: false });
  }, [notes, omits, autoGroup]);

  useImperativeHandle(ref, () => ({
    highlight,
  }));

  function highlight() {
    if (disabled) {
      return;
    }
    pianoRef.current?.highlight(notesWithGroup);
  }

  function onAttack() {
    if (disabled) {
      return;
    }
    pianoRef.current?.attack(notesWithGroup);
    state.pressed = true;
  }

  function onRelease() {
    if (disabled) {
      return;
    }
    pianoRef.current?.release();
    state.pressed = false;
  }

  return (
    <div ref={domRef}>
      <TouchEvent
        className={className}
        style={{
          background: state.pressed || active ? activeBgColor : undefined,
          color: state.pressed || active ? activeFgColor : undefined,
        }}
        onMouseEnter={highlight}
        onTouchStart={onAttack}
        onTouchEnd={onRelease}
        onMouseLeave={onRelease}
      >
        {children}
      </TouchEvent>
    </div>
  );
});
