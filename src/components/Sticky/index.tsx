import React, { ReactNode } from "react";
import StickyBox, { StickyBoxCompProps } from "react-sticky-box";

export interface StickyProps extends StickyBoxCompProps {
  children: ReactNode;
  disabled?: boolean;
}

export function Sticky(props: StickyProps) {
  const { children, disabled = false, className, ...stickyBoxProps } = props;

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <StickyBox
      className={className}
      style={{ alignSelf: "flex-start", ...stickyBoxProps.style }}
      {...stickyBoxProps}
    >
      {children}
    </StickyBox>
  );
}
