"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GenerateReportButton({ month }: { month: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate report");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-right">
      <button onClick={generate} disabled={busy} className="bg-accent rounded-lg px-4 py-2 text-sm font-medium">
        {busy ? "Thinking…" : "Generate last month's report"}
      </button>
      {error && <p className="text-xs text-expense mt-1">{error}</p>}
    </div>
  );
}
