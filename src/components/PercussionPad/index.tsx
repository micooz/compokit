"use client";
import React, { useImperativeHandle, useRef } from "react";
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

  const domRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (active) {
  //     domRef.current?.scrollIntoView(false);
  //   }
  // }, [active]);

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
    <div ref={domRef}>
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
    </div>
  );
});
