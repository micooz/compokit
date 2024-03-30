"use client";
import { useMount, useReactive } from "ahooks";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";

import { toneUtil } from "@/utils/tone";

export interface ToneLoaderProps {}

export function ToneLoader(props: ToneLoaderProps) {
  const state = useReactive({
    loaded: false,
    error: "",
  });

  useMount(init);

  function init() {
    state.error = "";

    toneUtil
      .init()
      .then(() => {
        state.loaded = true;
      })
      .catch((err) => {
        state.error = err.message;
      });
  }

  if (state.loaded) {
    return null;
  }

  if (state.error) {
    return (
      <div className="p-4 text-center bg-red-100">
        <div className="mb-2 text-red-700 text-sm">
          Failed to load audio samples: {state.error}
        </div>
        <Button
          className="w-24"
          label="Retry"
          severity="danger"
          size="small"
          onClick={init}
        />
      </div>
    );
  }

  return <ProgressBar mode="indeterminate" style={{ height: "0.3rem" }} />;
}
