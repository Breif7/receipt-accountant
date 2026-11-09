import { createClient } from "@/lib/supabase/server";
import { fmt } from "@/lib/stats";
import NewTransactionForm from "@/components/NewTransactionForm";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const [{ data: transactions }, { data: categories }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, categories(name, icon)")
      .order("date", { ascending: false })
      .limit(100),
    supabase.from("categories").select("id, name, icon").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <NewTransactionForm categories={categories ?? []} />
      <div className="card">
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
            {(transactions ?? []).map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="py-2">{t.date}</td>
                <td className="py-2">{t.merchant ?? t.description ?? "—"}</td>
                <td className="py-2">
                  {(t.categories as any)?.icon} {(t.categories as any)?.name ?? "—"}
                </td>
                <td className={`py-2 text-right ${t.type === "income" ? "text-income" : "text-expense"}`}>
                  {t.type === "income" ? "+" : "-"}
                  {fmt(Number(t.amount), t.currency)}
                </td>
              </tr>
            ))}
            {!transactions?.length && (
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
