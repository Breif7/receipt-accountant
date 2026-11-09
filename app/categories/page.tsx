import { createClient } from "@/lib/supabase/server";
import { ensureDefaultCategories } from "@/lib/categories";
import BudgetInput from "@/components/BudgetInput";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let { data: categories } = await supabase.from("categories").select("*").order("name");
  if (user && !categories?.length) {
    await ensureDefaultCategories(supabase, user.id);
    ({ data: categories } = await supabase.from("categories").select("*").order("name"));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {(categories ?? []).map((c) => (
          <div key={c.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </div>
            <BudgetInput categoryId={c.id} initial={c.monthly_budget} />
          </div>
        ))}
      </div>
    </div>
  );
}
