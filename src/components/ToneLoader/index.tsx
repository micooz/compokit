"use client";
import { useEffect } from "react";
import { toneUtil } from "@/utils/tone";

export interface ToneLoaderProps {}

export function ToneLoader(props: ToneLoaderProps) {
  useEffect(() => {
    toneUtil.init();
  }, []);

  return null;
}
