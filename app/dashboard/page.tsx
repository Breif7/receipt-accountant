import { createClient } from "@/lib/supabase/server";
import { monthRange, lastMonthRange, fmt } from "@/lib/stats";
import StatCard from "@/components/StatCard";
import CategoryDonut from "@/components/CategoryDonut";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { start, end } = monthRange();
  const { start: lastStart, end: lastEnd } = lastMonthRange();

  const [{ data: thisMonth }, { data: lastMonth }, { data: recentTx }, { data: recentReceipts }] =
    await Promise.all([
      supabase.from("transactions").select("*, categories(name, icon, color)").gte("date", start).lt("date", end),
      supabase.from("transactions").select("type, amount").gte("date", lastStart).lt("date", lastEnd),
      supabase
        .from("transactions")
        .select("*, categories(name, icon)")
        .order("date", { ascending: false })
        .limit(6),
      supabase
        .from("receipts")
        .select("id, raw_extraction, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const income = (thisMonth ?? []).filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = (thisMonth ?? [])
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const savings = income - expenses;

  const lastExpenses = (lastMonth ?? [])
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenseDelta = lastExpenses ? ((expenses - lastExpenses) / lastExpenses) * 100 : 0;

  const byCategory = new Map<string, { name: string; value: number; color: string }>();
  for (const t of thisMonth ?? []) {
    if (t.type !== "expense") continue;
    const cat = t.categories as any;
    const key = cat?.name ?? "Uncategorized";
    const entry = byCategory.get(key) ?? { name: key, value: 0, color: cat?.color ?? "#9ca3af" };
    entry.value += Number(t.amount);
    byCategory.set(key, entry);
  }
  const categoryData = Array.from(byCategory.values()).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Hello 👋</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Income" value={fmt(income)} tone="income" />
        <StatCard
          label="Expenses"
          value={fmt(expenses)}
          tone="expense"
          hint={lastExpenses ? `${expenseDelta >= 0 ? "+" : ""}${expenseDelta.toFixed(0)}% vs. last month` : undefined}
        />
        <StatCard label="Saved this month" value={fmt(savings)} tone={savings >= 0 ? "income" : "expense"} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Spending by category</h2>
          <CategoryDonut data={categoryData} total={expenses} />
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Recent receipts</h2>
          <div className="space-y-2">
            {(recentReceipts ?? []).map((r) => {
              const extraction = r.raw_extraction as any;
              return (
                <Link
                  key={r.id}
                  href={`/receipts/${r.id}`}
                  className="flex justify-between text-sm py-2 border-b border-border last:border-0 hover:text-accent"
                >
                  <span>{extraction?.merchant ?? "Unreadable"}</span>
                  <span className="text-gray-400">{extraction?.total ? fmt(extraction.total, extraction.currency) : "—"}</span>
                </Link>
              );
            })}
            {!recentReceipts?.length && <p className="text-sm text-gray-400">No receipts yet.</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Recent transactions</h2>
        <table className="w-full text-sm">
          <thead className="text-gray-400 text-left">
            <tr>
              <th className="font-normal py-2">Date</th>
              <th className="font-normal py-2">Merchant</th>
              <th className="font-normal py-2">Category</th>
              <th className="font-normal py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(recentTx ?? []).map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="py-2">{t.date}</td>
                <td className="py-2">{t.merchant ?? "—"}</td>
                <td className="py-2">
                  {(t.categories as any)?.icon} {(t.categories as any)?.name ?? "Uncategorized"}
                </td>
                <td className={`py-2 text-right ${t.type === "income" ? "text-income" : "text-expense"}`}>
                  {t.type === "income" ? "+" : "-"}
                  {fmt(Number(t.amount), t.currency)}
                </td>
              </tr>
            ))}
            {!recentTx?.length && (
              <tr>
                <td colSpan={4} className="py-4 text-gray-400 text-center">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
