"use client";
import React, { useMemo } from "react";
import { useMount, useReactive } from "ahooks";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";

import { Mode, ModeEnum } from "@/lib";
import { ModeItem } from "../../share";
import { TextBeauty } from "@/components/TextBeauty";

export interface AddItemFormProps {
  list: ModeItem[];
  onSubmit: (mode: ModeEnum, key: string) => void;
}

export function AddItemForm(props: AddItemFormProps) {
  const { list, onSubmit } = props;

  const state = useReactive({
    selectedMode: ModeEnum.NaturalMajor,
    selectedKey: "",
    addErrorMsg: "",
  });

  useMount(() => {
    onSelectMode(ModeEnum.NaturalMajor);
  });

  const modeOptions = useMemo(() => Mode.modes(), []);
  const keyOptions = useMemo(
    () => Mode.getKeys(state.selectedMode).names({ transformAccidental: true }),
    [state.selectedMode]
  );

  function onSelectMode(mode: ModeEnum) {
    state.selectedMode = mode;
  }

  function onSelectKey(key: string) {
    state.selectedKey = key;
  }

  function onAddTable() {
    state.addErrorMsg = "";

    if (state.selectedMode === undefined) {
      state.addErrorMsg = "Please select mode";
      return;
    }

    if (!state.selectedKey) {
      state.addErrorMsg = "Please select key";
      return;
    }

    const key = state.selectedKey;
    const mode = state.selectedMode;

    if (list.find((item) => item.key === key && item.mode === mode)) {
      state.addErrorMsg = "The table already exists";
      return;
    }

    onSubmit(mode, key);
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <Dropdown
        value={state.selectedMode}
        onChange={(e) => onSelectMode(e.value)}
        options={modeOptions}
        filter
        filterInputAutoFocus={false}
        optionGroupTemplate={(option) => (<div>- {option.group} -</div>)}
        optionGroupLabel="group"
        optionGroupChildren="items"
        placeholder="Select Mode"
        className="w-full"
      />
      <Dropdown
        value={state.selectedKey}
        onChange={(e) => onSelectKey(e.value)}
        options={keyOptions}
        itemTemplate={(option: string) => <TextBeauty>{option}</TextBeauty>}
        filter
        filterInputAutoFocus={false}
        placeholder="Select Key"
        className="w-full"
      />
      {state.addErrorMsg && (
        <Message className="w-full" severity="warn" text={state.addErrorMsg} />
      )}
      <Button label="Add" className="w-full" outlined onClick={onAddTable} />
    </div>
  );
}
