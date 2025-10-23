"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function UserLineChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <div className="bg-neutral-900 rounded-lg p-4">
      <h3 className="font-semibold mb-2">Người dùng theo ngày</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#6366F1" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
