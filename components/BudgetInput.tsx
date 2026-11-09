"use client";

import { useState } from "react";

export default function BudgetInput({ categoryId, initial }: { categoryId: string; initial: number | null }) {
  const [value, setValue] = useState(initial?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthly_budget: value ? parseFloat(value) : null }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Budget</span>
      <input
        type="number"
        placeholder="—"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        className="input w-24 text-right"
        disabled={saving}
      />
    </div>
  );
}
