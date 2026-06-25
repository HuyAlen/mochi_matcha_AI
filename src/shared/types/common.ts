export type ISODateString = string;
export type ISODateTimeString = string;

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface SelectOption<T = string> {
  label: string;
  value: T;
  description?: string;
}

export interface SyncMeta {
  syncedAt?: string;
  isDirty?: boolean;
  source?: "local" | "supabase" | "native";
}
