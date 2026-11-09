import { createClient } from "@/lib/supabase/server";
import GenerateReportButton from "@/components/GenerateReportButton";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase.from("reports").select("*").order("month", { ascending: false });

  const lastMonth = new Date();
  lastMonth.setDate(1);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthIso = lastMonth.toISOString().slice(0, 10);
  const hasLastMonth = reports?.some((r) => r.month === lastMonthIso);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Monthly reports</h1>
        {!hasLastMonth && <GenerateReportButton month={lastMonthIso} />}
      </div>

      <div className="space-y-4">
        {(reports ?? []).map((r) => (
          <div key={r.id} className="card">
            <h2 className="font-semibold mb-2">
              {new Date(r.month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <div className="text-sm text-gray-300 whitespace-pre-wrap">{r.content_md}</div>
          </div>
        ))}
        {!reports?.length && (
          <p className="text-sm text-gray-400">
            No reports yet. Generate last month's report once you have a few transactions logged.
          </p>
        )}
      </div>
    </div>
  );
}
