export type GlobalConfig = {
  multiSelect: boolean;
  showAssociatedNotes: boolean;
};

export const defaultGlobalConfig: GlobalConfig = {
  multiSelect: true,
  showAssociatedNotes: true,
};

export const storagePrefix = "compokit";

export enum StorageKeys {
  USER_CONFIG = "USER_CONFIG",
}
