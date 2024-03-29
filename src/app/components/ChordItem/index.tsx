"use client";
import React from "react";
import { useReactive } from "ahooks";

import { TextBeauty } from "@/components/TextBeauty";

export interface ChordItemProps {
  children: string;
}

export function ChordItem(props: ChordItemProps) {
  const { children: note } = props;

  const state = useReactive({
    // highlight: "none" as "light" | "normal" | "dark" | "none",
  });

  return (
    <div className="relative inline-block px-1 border border-transparent">
      <TextBeauty>{note}</TextBeauty>
    </div>
  );
}
