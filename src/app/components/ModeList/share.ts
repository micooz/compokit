import { ModeEnum } from "@/lib";

export type ModeItem = { id: string; key: string; mode: ModeEnum };

export function getItemId(key: string, mode: ModeEnum) {
  return `${key}_${mode}`;
}
