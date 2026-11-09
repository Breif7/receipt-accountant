import { SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "🍔", color: "#f472b6" },
  { name: "Transport", icon: "🚌", color: "#60a5fa" },
  { name: "Housing", icon: "🏠", color: "#fbbf24" },
  { name: "Utilities", icon: "💡", color: "#34d399" },
  { name: "Entertainment", icon: "🎬", color: "#a78bfa" },
  { name: "Health", icon: "💊", color: "#f87171" },
  { name: "Shopping", icon: "🛍️", color: "#38bdf8" },
  { name: "Other", icon: "📦", color: "#9ca3af" },
];

// Idempotent: relies on the unique (user_id, name) constraint, ignores duplicates.
export async function ensureDefaultCategories(supabase: SupabaseClient, userId: string) {
  await supabase
    .from("categories")
    .upsert(
      DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: userId })),
      { onConflict: "user_id,name", ignoreDuplicates: true }
    );
}
