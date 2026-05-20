import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/admin/analytics")({ component: A });
function A() {
  const [tx, setTx] = useState<any[]>([]);
  useEffect(() => { supabase.from("transactions").select("type,amount_usd,created_at").then(({ data }) => setTx(data ?? [])); }, []);
  const byType: Record<string, number> = {};
  tx.forEach((t) => { byType[t.type] = (byType[t.type] ?? 0) + Number(t.amount_usd); });
  const pie = Object.entries(byType).map(([name, value]) => ({ name, value }));
  const byDay: Record<string, number> = {};
  tx.forEach((t) => { const k = new Date(t.created_at).toLocaleDateString(); byDay[k] = (byDay[k] ?? 0) + Number(t.amount_usd); });
  const bar = Object.entries(byDay).map(([date, v]) => ({ date, v }));
  const colors = ["#000", "#444", "#888", "#bbb", "#ddd"];
  return (
    <>
      <PageHeader title="Admin Analytics" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Revenue mix">
          <div className="h-72"><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" nameKey="name" outerRadius={100} label>
            {pie.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Daily volume">
          <div className="h-72"><ResponsiveContainer><BarChart data={bar}>
            <CartesianGrid stroke="hsl(0 0% 92%)" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
            <Bar dataKey="v" fill="#000" />
          </BarChart></ResponsiveContainer></div>
        </Panel>
      </div>
    </>
  );
}
