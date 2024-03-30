import "client-only";
import store from "store2";

import type { ModeItem } from "@/app/components/ModeList/share";
import type { ProgressionItem } from "@/typings/storage";

class Storage {
  private prefix = "compokit";

  get progressions(): ProgressionItem[] | undefined {
    return this.getData("progression", "list");
  }

  set progressions(items: ProgressionItem[]) {
    this.setData("progression", "list", items);
  }

  get currentProgressionIndex() {
    return this.getData("progression", "current");
  }

  set currentProgressionIndex(index: number) {
    this.setData("progression", "current", index);
  }

  get showRelatedNotes() {
    return this.getData("mode", "showRelatedNotes");
  }

  set showRelatedNotes(show: boolean) {
    this.setData("mode", "showRelatedNotes", show);
  }

  get tables(): ModeItem[] | undefined {
    return this.getData("mode", "tables");
  }

  set tables(items: ModeItem[]) {
    this.setData("mode", "tables", items);
  }

  private getFullKey(namespace: string, key: string) {
    return `${this.prefix}/${namespace}/${key}`;
  }

  private getData(namespace: string, key: string, alt?: any) {
    const fullKey = this.getFullKey(namespace, key);
    return store.get(fullKey, alt);
  }

  private setData(namespace: string, key: string, value: any) {
    const fullKey = this.getFullKey(namespace, key);
    store.set(fullKey, value);
  }
}

export const storage = new Storage();
