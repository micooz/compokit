"use client";
import React, { useImperativeHandle } from "react";
import { useReactive } from "ahooks";

import { PianoKeyboardRef } from "../PianoKeyboard";
import { TouchEvent } from "../TouchEvent";

export interface PercussionPadRef {
  // highlight: () => void;
}

export interface PercussionPadProps {
  className?: string;
  pianoRef: React.RefObject<PianoKeyboardRef>;
  disabled?: boolean;
  notes: string[];
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
    active = false,
    activeBgColor = "#3576cb",
    activeFgColor = "#ffffff",
    children,
  } = props;

  const state = useReactive({
    pressed: false,
  });

  useImperativeHandle(ref, () => ({
    // highlight,
  }));

  function onMouseEnter() {
    if (disabled) {
      return;
    }
    pianoRef.current?.mouseHover(notes);
  }

  function onAttack() {
    if (disabled) {
      return;
    }
    pianoRef.current?.attack(notes);
    state.pressed = true;
  }

  function onRelease() {
    if (disabled) {
      return;
    }
    pianoRef.current?.release();
    pianoRef.current?.mouseLeave();
    state.pressed = false;
  }

  return (
    <TouchEvent
      className={className}
      style={{
        background: state.pressed || active ? activeBgColor : undefined,
        color: state.pressed || active ? activeFgColor : undefined,
      }}
      onMouseEnter={onMouseEnter}
      onTouchStart={onAttack}
      onTouchEnd={onRelease}
      onMouseLeave={onRelease}
    >
      {children}
    </TouchEvent>
  );
});
