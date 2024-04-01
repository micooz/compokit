"use client";
import React from "react";
import { MegaMenu } from "primereact/megamenu";
import { Button } from "primereact/button";
import Link from "next/link";

import { Sticky } from "@/components/Sticky";

export interface HeaderProps {}

export function Header(props: HeaderProps) {
  const {} = props;

  return (
    <Sticky className="z-30 shadow-sm">
      <MegaMenu
        className="flex justify-between items-center"
        model={[
          {
            label: "CompoKit",
            icon: "pi pi-home",
            url: "/",
            style: { fontWeight: "500" },
          },
        ]}
        end={
          <Link  className="px-2" href="https://github.com/micooz/compokit" target="_blank">
            <i className="pi pi-github" />
          </Link>
        }
      />
    </Sticky>
  );
}
