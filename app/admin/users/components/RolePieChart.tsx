"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function RolePieChart({ data }: { data: { role: string; count: number }[] }) {
  const COLORS = ["#6366F1", "#10B981", "#F43F5E"];

  return (
    <div className="bg-neutral-900 rounded-lg p-4">
      <h3 className="font-semibold mb-2">Tỷ lệ Role</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="role" outerRadius={100} label>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
