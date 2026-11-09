"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type Slice = { name: string; value: number; color: string };

export default function CategoryDonut({ data, total }: { data: Slice[]; total: number }) {
  if (!data.length) {
    return <p className="text-sm text-gray-400">No expenses yet this month.</p>;
  }

  return (
    <div className="relative h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
            contentStyle={{ background: "#171a21", border: "1px solid #272b33", borderRadius: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs text-gray-400">Total</span>
        <span className="text-lg font-semibold">${total.toFixed(0)}</span>
      </div>
    </div>
  );
}
