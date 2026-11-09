"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Category = { id: string; name: string; icon: string };

export default function NewTransactionForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [merchant, setMerchant] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          date,
          merchant,
          category_id: type === "expense" ? categoryId : null,
        }),
      });
      setAmount("");
      setMerchant("");
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="bg-accent rounded-lg px-4 py-2 text-sm font-medium">
        + Add transaction
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card grid sm:grid-cols-5 gap-3 items-end">
      <label className="text-xs text-gray-400">
        Type
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="input mt-1"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>
      <label className="text-xs text-gray-400">
        Amount
        <input
          type="number"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input mt-1"
        />
      </label>
      <label className="text-xs text-gray-400">
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input mt-1" />
      </label>
      <label className="text-xs text-gray-400">
        Merchant / note
        <input value={merchant} onChange={(e) => setMerchant(e.target.value)} className="input mt-1" />
      </label>
      {type === "expense" && (
        <label className="text-xs text-gray-400">
          Category
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input mt-1">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="sm:col-span-5 flex gap-2">
        <button disabled={saving} className="bg-accent rounded-lg px-4 py-2 text-sm font-medium">
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-400">
          Cancel
        </button>
      </div>
    </form>
  );
}
