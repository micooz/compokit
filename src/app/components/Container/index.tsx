import React from "react";

import { ModeList } from "../../components/ModeList";
import { ProgressionDesigner } from "../../components/ProgressionDesigner";

export interface ContainerProps {}

export function Container(props: ContainerProps) {
  const {} = props;

  return (
    <div className="flex max-xl:flex-col">
      <ProgressionDesigner className="xl:w-5/12 w-full mb-4 p-4" />
      <ModeList className="xl:w-7/12 p-4 pt-0" />
    </div>
  );
}
