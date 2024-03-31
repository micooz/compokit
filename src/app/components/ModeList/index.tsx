"use client";
import React from "react";
import { useMount, useReactive } from "ahooks";
import classNames from "classnames";
import { ReactSortable } from "react-sortablejs";
import { Skeleton } from "primereact/skeleton";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";

import { Mode, ModeEnum } from "@/lib";
import { storage } from "@/utils/storage";

import { ChordTable } from "../ChordTable";
import { ModeListOptions } from "../ModeListOptions";
import { ModeItem, getItemId } from "./share";
import { AddItemForm } from "./partials/AddItemForm";

export interface ModeListProps {
  className?: string;
}

export function ModeList(props: ModeListProps) {
  const { className } = props;

  const state = useReactive({
    list: [] as ModeItem[],
    loaded: false,
    addItemDialog: { show: false },
  });

  useMount(() => {
    const tables = storage.tables || [
      {
        id: getItemId("C", ModeEnum.NaturalMajor),
        key: "C",
        mode: ModeEnum.NaturalMajor,
      },
    ];
    state.list = tables;
    state.loaded = true;
  });

  function onSort() {
    storage.tables = state.list;
  }

  function onRemove(id: string, mode: Mode) {
    const name = mode.name({ transformAccidental: true });

    confirmDialog({
      header: "Remove Table",
      message: (
        <div>
          Are you sure to remove:
          <span className="inline-block mx-2 font-semibold">{name}</span>?
        </div>
      ),
      accept: () => {
        state.list = state.list.filter((item) => item.id !== id);
        storage.tables = state.list;
      },
    });
  }

  function onAdd(mode: ModeEnum, key: string) {
    state.list.push({ id: getItemId(key, mode), key, mode });
    state.addItemDialog.show = false;
    storage.tables = state.list;
  }

  const responsiveClassNames = classNames(
    "grid gap-3 grid-cols-4",
    "max-[2115px]:grid-cols-3",
    "max-[1513px]:grid-cols-2",
    "max-[1080px]:grid-cols-1"
  );

  if (!state.loaded) {
    return (
      <div className={responsiveClassNames}>
        <div className="flex flex-col gap-2">
          <Skeleton width="100%" height="37px" />
          <Skeleton width="70%" height="24px" />
          <Skeleton width="80%" height="14px" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton width="100%" height="37px" />
          <Skeleton width="70%" height="24px" />
          <Skeleton width="80%" height="14px" />
        </div>
      </div>
    );
  }

  return (
    <div className={classNames(className)}>
      <span className="text-base font-bold border-l-4 pl-2 border-[#1174c0]">
        Mode Tables
      </span>

      <ModeListOptions className="my-2" />

      <Button
        size="small"
        icon="pi pi-plus"
        label="New Table"
        style={{ marginBottom: 12 }}
        onClick={() => (state.addItemDialog.show = true)}
      />

      <ReactSortable
        list={state.list}
        setList={(newList) => (state.list = newList)}
        onSort={onSort}
        animation={200}
        handle=".dragHandle"
        className={responsiveClassNames}
      >
        {state.list.map((item) => {
          const mode = Mode.from(item.key, item.mode);

          return (
            <ChordTable
              key={item.id}
              mode={mode}
              onRemove={() => onRemove(item.id, mode)}
            />
          );
        })}
      </ReactSortable>

      <Dialog
        visible={state.addItemDialog.show}
        onHide={() => (state.addItemDialog.show = false)}
        header="New Table"
        style={{ width: "300px" }}
      >
        <AddItemForm list={state.list} onSubmit={onAdd} />
      </Dialog>
    </div>
  );
}
