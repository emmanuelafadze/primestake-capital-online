import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Loader2 } from "lucide-react";

type Pkg = { id: string; name: string; slug: string };
type Match = {
  id: string;
  package_id: string | null;
  league: string | null;
  home_team: string;
  away_team: string;
  match_date: string;
  predicted_score: string | null;
  odds: number | null;
  result: string | null;
  status: string | null;
  created_at: string;
};

const EMPTY: Partial<Match> = {
  package_id: "", league: "", home_team: "", away_team: "",
  match_date: "", predicted_score: "", odds: null, result: "", status: "scheduled",
};

type Leg = { league: string; home_team: string; away_team: string; match_date: string; predicted_score: string; odds: string; result: string };
const EMPTY_LEG: Leg = { league: "", home_team: "", away_team: "", match_date: "", predicted_score: "", odds: "", result: "" };

function Page() {
  const [rows, setRows] = useState<Match[]>([]);
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Match>>(EMPTY);
  const [leg2, setLeg2] = useState<Leg>({ ...EMPTY_LEG });
  const [saving, setSaving] = useState(false);

  const selectedPkg = pkgs.find((p) => p.id === editing.package_id);
  const isCombo = selectedPkg?.slug === "combo" && !editing.id;


  async function load() {
    setLoading(true);
    const [m, p] = await Promise.all([
      supabase.from("fixed_matches").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("packages").select("id,name,slug").order("price_usd"),
    ]);
    if (m.error) toast.error(m.error.message);
    setRows(m.data ?? []);
    setPkgs(p.data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function startNew() { setEditing({ ...EMPTY }); setLeg2({ ...EMPTY_LEG }); setOpen(true); }
  function startEdit(r: Match) {
    setEditing({
      ...r,
      match_date: r.match_date ? new Date(r.match_date).toISOString().slice(0, 16) : "",
    });
    setLeg2({ ...EMPTY_LEG });
    setOpen(true);
  }

  async function save() {
    if (!editing.home_team || !editing.away_team || !editing.match_date) {
      toast.error("Home, away and match date are required.");
      return;
    }
    if (isCombo && (!leg2.home_team || !leg2.away_team || !leg2.match_date)) {
      toast.error("Combo requires two matches — fill both legs.");
      return;
    }
    setSaving(true);
    const payload = {
      package_id: editing.package_id || null,
      league: editing.league || null,
      home_team: editing.home_team!,
      away_team: editing.away_team!,
      match_date: new Date(editing.match_date as string).toISOString(),
      predicted_score: editing.predicted_score || null,
      odds: editing.odds == null || editing.odds === ("" as any) ? null : Number(editing.odds),
      result: editing.result || null,
      status: editing.status || "scheduled",
    };
    let error: any = null;
    if (editing.id) {
      ({ error } = await supabase.from("fixed_matches").update(payload).eq("id", editing.id));
    } else if (isCombo) {
      const second = {
        package_id: editing.package_id || null,
        league: leg2.league || null,
        home_team: leg2.home_team,
        away_team: leg2.away_team,
        match_date: new Date(leg2.match_date).toISOString(),
        predicted_score: leg2.predicted_score || null,
        odds: leg2.odds === "" ? null : Number(leg2.odds),
        result: leg2.result || null,
        status: editing.status || "scheduled",
      };
      ({ error } = await supabase.from("fixed_matches").insert([payload, second]));
    } else {
      ({ error } = await supabase.from("fixed_matches").insert(payload));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing.id ? "Match updated." : isCombo ? "Combo (2 matches) created." : "Match created.");
    setOpen(false);
    load();
  }


  async function remove(id: string) {
    if (!confirm("Delete this match?")) return;
    const { error } = await supabase.from("fixed_matches").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted.");
    setRows((r) => r.filter((x) => x.id !== id));
  }

  const pkgName = (id: string | null) => pkgs.find((p) => p.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader
        title="Fixed Matches"
        subtitle="Create, assign to tier (package), and release fixtures."
        actions={
          <button onClick={startNew} className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background">
            <Plus className="h-4 w-4" /> New match
          </button>
        }
      />

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 pr-4">Fixture</th>
                <th className="py-3 pr-4">Tier</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Score</th>
                <th className="py-3 pr-4">Result</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-3 pr-4 font-medium">{r.home_team} vs {r.away_team}<div className="text-xs text-muted-foreground">{r.league ?? ""}</div></td>
                  <td className="py-3 pr-4">{pkgName(r.package_id)}</td>
                  <td className="py-3 pr-4">{new Date(r.match_date).toLocaleString()}</td>
                  <td className="py-3 pr-4">{r.predicted_score ?? "—"}</td>
                  <td className="py-3 pr-4">{r.result ?? "—"}</td>
                  <td className="py-3 pr-4">{r.status}</td>
                  <td className="py-3 pr-4 text-right">
                    <button onClick={() => startEdit(r)} className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(r.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No matches yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-xl rounded-2xl border border-border bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editing.id ? "Edit match" : "New match"}</h3>
              <button onClick={() => setOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-accent"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Home team"><Input value={editing.home_team ?? ""} onChange={(v) => setEditing({ ...editing, home_team: v })} /></Field>
              <Field label="Away team"><Input value={editing.away_team ?? ""} onChange={(v) => setEditing({ ...editing, away_team: v })} /></Field>
              <Field label="League"><Input value={editing.league ?? ""} onChange={(v) => setEditing({ ...editing, league: v })} /></Field>
              <Field label="Match date">
                <input type="datetime-local" value={(editing.match_date as string) ?? ""} onChange={(e) => setEditing({ ...editing, match_date: e.target.value })} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" />
              </Field>
              <Field label="Tier (package)">
                <select value={editing.package_id ?? ""} onChange={(e) => setEditing({ ...editing, package_id: e.target.value })} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm">
                  <option value="">— Unassigned —</option>
                  {pkgs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <Field label="Predicted score"><Input value={editing.predicted_score ?? ""} onChange={(v) => setEditing({ ...editing, predicted_score: v })} placeholder="2-1" /></Field>
              <Field label="Odds"><Input value={editing.odds == null ? "" : String(editing.odds)} onChange={(v) => setEditing({ ...editing, odds: v === "" ? null : (Number(v) as any) })} placeholder="3.50" /></Field>
              <Field label="Result"><Input value={editing.result ?? ""} onChange={(v) => setEditing({ ...editing, result: v })} placeholder="won / lost / pending" /></Field>
              <Field label="Status">
                <select value={editing.status ?? "scheduled"} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm">
                  <option value="scheduled">scheduled</option>
                  <option value="released">released</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="h-10 rounded-full border border-border px-4 text-sm">Cancel</button>
              <button disabled={saving} onClick={save} className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>{children}</label>;
}
function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" />;
}

export const Route = createFileRoute("/admin/matches")({ component: Page });
