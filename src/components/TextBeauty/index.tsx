"use client";
import React, { CSSProperties } from "react";

export interface TextBeautyProps {
  className?: string;
  style?: CSSProperties;
  children: string | string[];
}

export function TextBeauty(props: TextBeautyProps) {
  const { className, style, children } = props;

  const items = Array.isArray(children) ? children : [children];

  const html = items
    .map((it) => it.replace(/(\(?[♮♯𝄪♭𝄫]5?\)?)/g, "<sup>$1</sup>"))
    .join("");

  return (
    <span
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
