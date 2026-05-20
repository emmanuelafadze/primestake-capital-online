import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard/analytics")({ component: A });

function A() {
  const { user } = useAuth(); const [tx, setTx] = useState<any[]>([]);
  useEffect(() => { user && supabase.from("transactions").select("*").eq("user_id", user.id).then(({ data }) => setTx(data ?? [])); }, [user]);
  const grouped: Record<string, number> = {};
  tx.forEach((t) => { const k = new Date(t.created_at).toLocaleDateString(); grouped[k] = (grouped[k] ?? 0) + Number(t.amount_usd); });
  const data = Object.entries(grouped).map(([date, value]) => ({ date, value }));
  return (
    <>
      <PageHeader title="Analytics" />
      <Panel title="Transaction volume">
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid stroke="hsl(0 0% 92%)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
              <Tooltip /><Bar dataKey="value" fill="#000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </>
  );
}
