import "client-only";
import store from "store2";

import type { ModeItem } from "@/app/components/ModeList/share";
import type { ProgressionItem } from "@/typings/storage";
import { GlobalConfig, defaultGlobalConfig } from "@/constants";

class Storage {
  private prefix = "compokit";

  get tables(): ModeItem[] | undefined {
    return this.getData("tables");
  }

  set tables(items: ModeItem[]) {
    this.setData("tables", items);
  }

  get progressions(): ProgressionItem[] | undefined {
    return this.getData("progressions");
  }

  set progressions(items: ProgressionItem[]) {
    this.setData("progressions", items);
  }

  get activeProgressionIndex() {
    return this.getData("active-progression-index");
  }

  set activeProgressionIndex(index: number) {
    this.setData("active-progression-index", index);
  }

  get globalConfig() {
    return this.getData("globalConfig", defaultGlobalConfig);
  }

  set globalConfig(config: GlobalConfig) {
    this.setData("globalConfig", config);
  }

  private getFullKey(key: string) {
    return `${this.prefix}/${key}`;
  }

  private getData(key: string, alt?: any) {
    const fullKey = this.getFullKey(key);
    return store.get(fullKey, alt);
  }

  private setData(key: string, value: any) {
    const fullKey = this.getFullKey(key);
    store.set(fullKey, value);
  }
}

export const storage = new Storage();
