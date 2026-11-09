"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Category = { id: string; name: string; icon: string };
type Receipt = { id: string; status: string; raw_extraction: any };

export default function ReceiptReview({
  receipt,
  categories,
}: {
  receipt: Receipt;
  categories: Category[];
}) {
  const extraction = receipt.raw_extraction ?? {};
  const router = useRouter();
  const [merchant, setMerchant] = useState(extraction.merchant ?? "");
  const [date, setDate] = useState(extraction.date ?? new Date().toISOString().slice(0, 10));
  const [total, setTotal] = useState(String(extraction.total ?? ""));
  const [currency, setCurrency] = useState(extraction.currency ?? "USD");
  const [categoryId, setCategoryId] = useState(
    categories.find((c) => c.name === extraction.category)?.id ?? categories[0]?.id ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmed = receipt.status === "confirmed";

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/receipts/${receipt.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant,
          date,
          total: parseFloat(total),
          currency,
          category_id: categoryId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      router.push("/receipts");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card space-y-4">
      <h2 className="font-semibold">{confirmed ? "Confirmed receipt" : "Review extracted data"}</h2>
      {!extraction.merchant && !confirmed && (
        <p className="text-xs text-yellow-400">
          Claude couldn't read this receipt clearly — fields are blank, fill them in manually.
        </p>
      )}

      <Field label="Merchant">
        <input
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          disabled={confirmed}
          className="input"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={confirmed}
            className="input"
          />
        </Field>
        <Field label="Currency">
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={confirmed}
            className="input"
          />
        </Field>
      </div>
      <Field label="Total">
        <input
          type="number"
          step="0.01"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          disabled={confirmed}
          className="input"
        />
      </Field>
      <Field label="Category">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={confirmed}
          className="input"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </Field>

      {extraction.items?.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-1">Items</div>
          <ul className="text-sm space-y-1">
            {extraction.items.map((it: any, i: number) => (
              <li key={i} className="flex justify-between">
                <span>{it.name}</span>
                <span>{it.price}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-expense">{error}</p>}

      {!confirmed && (
        <button
          onClick={save}
          disabled={saving || !date || !total}
          className="w-full bg-accent rounded-lg py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Confirm & save"}
        </button>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-400 block mb-1">{label}</span>
      {children}
    </label>
  );
}
