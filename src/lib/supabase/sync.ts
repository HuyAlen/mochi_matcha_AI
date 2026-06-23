import { supabase } from "@/lib/supabase/client";

export type SyncTable =
  | "baby_profiles"
  | "tracking_entries"
  | "vaccine_records"
  | "vaccine_reactions";

type SyncableItem = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  scheduledDate?: string;
  completedDate?: string;
};

export const SUPABASE_SYNC_EVENT = "mind-ai:supabase-sync";
export const SUPABASE_SYNC_AT_KEY = "mind-ai:last-sync-at";
export const SUPABASE_SYNC_STATUS_KEY = "mind-ai:sync-status";
export const SUPABASE_SYNC_ERROR_KEY = "mind-ai:sync-error";

export type SupabaseSyncStatus =
  | "idle"
  | "syncing"
  | "synced"
  | "error"
  | "offline";

type PendingSyncJob = {
  table: SyncTable;
  items: SyncableItem[];
  timerId?: ReturnType<typeof setTimeout>;
};

const pendingSyncJobs = new Map<SyncTable, PendingSyncJob>();
const DEFAULT_QUEUE_DELAY_MS = 700;

function canUseBrowserStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function isBrowserOnline() {
  return typeof navigator === "undefined" || navigator.onLine;
}

function emitSyncEvent() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(SUPABASE_SYNC_EVENT));
}

function logSync(message: string, payload?: unknown) {
  if (process.env.NODE_ENV === "production") return;

  if (payload === undefined) {
    console.info(`[MindAI Sync] ${message}`);
    return;
  }

  console.info(`[MindAI Sync] ${message}`, payload);
}

function warnSync(message: string, payload?: unknown) {
  if (payload === undefined) {
    console.warn(`[MindAI Sync] ${message}`);
    return;
  }

  console.warn(`[MindAI Sync] ${message}`, payload);
}

export function getLastSupabaseSyncAt() {
  if (!canUseBrowserStorage()) return null;

  return window.localStorage.getItem(SUPABASE_SYNC_AT_KEY);
}

export function getSupabaseSyncStatus(): SupabaseSyncStatus {
  if (!isBrowserOnline()) return "offline";
  if (!canUseBrowserStorage()) return "idle";

  return (
    (window.localStorage.getItem(
      SUPABASE_SYNC_STATUS_KEY,
    ) as SupabaseSyncStatus | null) || "idle"
  );
}

export function getSupabaseSyncError() {
  if (!canUseBrowserStorage()) return null;

  return window.localStorage.getItem(SUPABASE_SYNC_ERROR_KEY);
}

function setSupabaseSyncStatus(
  status: SupabaseSyncStatus,
  errorMessage?: string,
) {
  if (!canUseBrowserStorage()) return;

  window.localStorage.setItem(SUPABASE_SYNC_STATUS_KEY, status);

  if (errorMessage) {
    window.localStorage.setItem(SUPABASE_SYNC_ERROR_KEY, errorMessage);
  } else {
    window.localStorage.removeItem(SUPABASE_SYNC_ERROR_KEY);
  }

  emitSyncEvent();
}

function markSupabaseSyncing() {
  setSupabaseSyncStatus("syncing");
}

function markSupabaseSyncPending(reason = "Chờ đồng bộ") {
  if (!canUseBrowserStorage()) return;

  window.localStorage.setItem(SUPABASE_SYNC_STATUS_KEY, "idle");
  window.localStorage.setItem(SUPABASE_SYNC_ERROR_KEY, reason);
  emitSyncEvent();
}

function markSupabaseSyncSuccess() {
  if (!canUseBrowserStorage()) return;

  const syncedAt = new Date().toISOString();

  window.localStorage.setItem(SUPABASE_SYNC_AT_KEY, syncedAt);
  window.localStorage.setItem(SUPABASE_SYNC_STATUS_KEY, "synced");
  window.localStorage.removeItem(SUPABASE_SYNC_ERROR_KEY);

  logSync("success", syncedAt);
  emitSyncEvent();
}

function markSupabaseSyncError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Không thể đồng bộ Supabase.";

  warnSync("failed", error);
  setSupabaseSyncStatus("error", message);
}

function getUpdatedAt<T extends SyncableItem>(item: T) {
  return (
    item.updatedAt ||
    item.createdAt ||
    item.completedDate ||
    item.scheduledDate ||
    new Date().toISOString()
  );
}

export async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error("Bạn chưa đăng nhập Supabase.");

  return data.user.id;
}

export async function pushItems<T extends SyncableItem>(
  table: SyncTable,
  items: T[],
) {
  if (!isBrowserOnline()) {
    setSupabaseSyncStatus("offline");
    return;
  }

  try {
    markSupabaseSyncing();
    logSync("start push", { table, count: items.length });

    const userId = await getCurrentUserId();

    if (!items.length) {
      markSupabaseSyncSuccess();
      return;
    }

    const rows = items.map((item) => ({
      id: item.id,
      user_id: userId,
      payload: item,
      updated_at: getUpdatedAt(item),
    }));

    const { error } = await supabase.from(table).upsert(rows, {
      onConflict: "id",
    });

    if (error) throw error;

    markSupabaseSyncSuccess();
  } catch (error) {
    markSupabaseSyncError(error);
    throw error;
  }
}

export function queuePushItems<T extends SyncableItem>(
  table: SyncTable,
  items: T[],
  delayMs = DEFAULT_QUEUE_DELAY_MS,
) {
  if (typeof window === "undefined") return;

  if (!isBrowserOnline()) {
    setSupabaseSyncStatus("offline");
    return;
  }

  const previousJob = pendingSyncJobs.get(table);
  if (previousJob?.timerId) clearTimeout(previousJob.timerId);

  markSupabaseSyncPending("Đang chờ lượt đồng bộ tiếp theo");
  logSync("queued", { table, count: items.length });

  const timerId = setTimeout(() => {
    pendingSyncJobs.delete(table);
    void pushItems(table, items).catch(() => {
      // pushItems already updates the sync status and logs the error.
    });
  }, delayMs);

  pendingSyncJobs.set(table, {
    table,
    items,
    timerId,
  });
}

export async function pullItems<T>(table: SyncTable): Promise<T[]> {
  if (!isBrowserOnline()) {
    setSupabaseSyncStatus("offline");
    return [];
  }

  try {
    markSupabaseSyncing();
    logSync("start pull", { table });

    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from(table)
      .select("payload")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    markSupabaseSyncSuccess();

    return (data ?? []).map((row) => row.payload as T);
  } catch (error) {
    markSupabaseSyncError(error);
    throw error;
  }
}

export async function deleteItem(table: SyncTable, id: string) {
  if (!isBrowserOnline()) {
    setSupabaseSyncStatus("offline");
    return;
  }

  try {
    markSupabaseSyncing();
    logSync("start delete", { table, id });

    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;

    markSupabaseSyncSuccess();
  } catch (error) {
    markSupabaseSyncError(error);
    throw error;
  }
}

export function clearSupabaseSyncState() {
  if (!canUseBrowserStorage()) return;

  window.localStorage.removeItem(SUPABASE_SYNC_AT_KEY);
  window.localStorage.removeItem(SUPABASE_SYNC_STATUS_KEY);
  window.localStorage.removeItem(SUPABASE_SYNC_ERROR_KEY);
  emitSyncEvent();
}
