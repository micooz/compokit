export type GlobalConfig = {
  multiSelect: boolean;
  showRelatedNotes: boolean;
};

export const defaultGlobalConfig: GlobalConfig = {
  multiSelect: true,
  showRelatedNotes: true,
};

export const storagePrefix = "compokit";

export enum StorageKeys {
  USER_CONFIG = "USER_CONFIG",
}
