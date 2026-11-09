export default function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: "income" | "expense";
}) {
  return (
    <div className="card">
      <div className="text-sm text-gray-400">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${tone === "income" ? "text-income" : "text-expense"}`}>
        {value}
      </div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}
