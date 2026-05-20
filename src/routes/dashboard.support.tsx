import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/support")({ component: S });

function S() {
  const { user } = useAuth(); const [rows, setRows] = useState<any[]>([]); const [body, setBody] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!user) return;
    const load = () => supabase.from("support_messages").select("*").eq("user_id", user.id).order("created_at").then(({ data }) => { setRows(data ?? []); setTimeout(() => end.current?.scrollIntoView(), 100); });
    load();
    const ch = supabase.channel("chat").on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `user_id=eq.${user.id}` }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); if (!body.trim() || !user) return;
    await supabase.from("support_messages").insert({ user_id: user.id, sender: "user", body });
    setBody("");
  };
  return (
    <>
      <PageHeader title="Support" subtitle="Talk to our concierge desk." />
      <Panel>
        <div className="h-96 overflow-y-auto rounded-lg bg-secondary/40 p-4">
          {rows.map((m) => (
            <div key={m.id} className={`mb-3 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${m.sender === "user" ? "bg-foreground text-background" : "bg-card border border-border"}`}>
                {m.body}
              </div>
            </div>
          ))}
          <div ref={end} />
        </div>
        <form onSubmit={send} className="mt-4 flex gap-2">
          <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message…"
            className="flex-1 rounded-full border border-input bg-background px-4 py-3 text-sm" />
          <button className="rounded-full bg-foreground px-6 text-sm font-medium text-background">Send</button>
        </form>
      </Panel>
    </>
  );
}
