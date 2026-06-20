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
  if (!data.user) throw new Error("Bạn chưa đăng nhập.");

  return data.user.id;
}

export async function pushItems<T extends SyncableItem>(
  table: SyncTable,
  items: T[],
) {
  const userId = await getCurrentUserId();

  if (!items.length) return;

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
}

export async function pullItems<T>(table: SyncTable): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select("payload")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => row.payload as T);
}
