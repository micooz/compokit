"use client";
import { useEffect } from "react";
import EventEmitter from "events";

import type { EventName, EventArgs } from "@/typings/ee";

const emitter = new EventEmitter();
emitter.setMaxListeners(999);

function emit<T extends EventName>(eventName: T, args: EventArgs[T]) {
  emitter.emit(eventName, args);
}

function useEvent<T extends EventName>(
  eventName: T,
  callback: (args: EventArgs[T]) => void
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => on(eventName, callback), []);
}

function on<T extends EventName>(
  eventName: T,
  listener: (args: EventArgs[T]) => void
) {
  emitter.on(eventName, listener);
  return () => off(eventName, listener);
}

function off<T extends EventName>(
  eventName: T,
  listener: (args: EventArgs[T]) => void
) {
  emitter.off(eventName, listener);
}

export const ee = { emit, useEvent };
