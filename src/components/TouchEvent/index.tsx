"use client";
import React, { CSSProperties, DOMAttributes } from "react";

export interface TouchEventProps extends DOMAttributes<HTMLElement> {
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}

export function TouchEvent(props: TouchEventProps) {
  const {
    className,
    style,
    children,
    onTouchStart,
    onTouchEnd,
    onMouseDown,
    ...rest
  } = props;

  return (
    <div
      {...rest}
      className={className}
      style={style}
      // for mobile device
      onTouchStart={(e) => {
        // console.log("onTouchStart");
        if (onTouchStart) {
          e.stopPropagation();
          onTouchStart(e);
        }
      }}
      onTouchEnd={(e) => {
        // console.log("onTouchEnd");
        if (onTouchEnd) {
          e.preventDefault();
          onTouchEnd(e);
        }
      }}
      onTouchCancel={(e) => {
        console.log("onTouchCancel");
        if (onTouchEnd) {
          onTouchEnd(e);
        }
      }}
      // for pc
      onMouseDown={(e: any) => {
        // console.log("onMouseDown");
        e.stopPropagation();
        onTouchStart?.(e);
      }}
      onMouseUp={(e: any) => {
        // console.log("onMouseUp");
        onTouchEnd?.(e);
      }}

    >
      {children}
    </div>
  );
}
