import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Eye } from "lucide-react";

type Kyc = Record<string, any>;

function statusVariant(s: string) {
  if (s === "approved") return "default";
  if (s === "rejected") return "destructive";
  if (s === "submitted" || s === "under_review") return "secondary";
  return "outline";
}

function Field({ label, value }: { label: string; value: any }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground break-words">{String(value)}</p>
    </div>
  );
}

function DocLink({ label, url }: { label: string; url?: string | null }) {
  if (!url) return null;
  const isImg = /\.(png|jpe?g|webp|gif)$/i.test(url);
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      {isImg ? (
        <a href={url} target="_blank" rel="noreferrer" className="block">
          <img src={url} alt={label} className="h-48 w-full rounded-lg border border-border object-cover" />
        </a>
      ) : (
        <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary underline break-all">
          View document
        </a>
      )}
    </div>
  );
}

function Page() {
  const [rows, setRows] = useState<Kyc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Kyc | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("onboarding_forms")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function decide(id: string, status: "approved" | "rejected") {
    setBusy(true);
    const { error } = await supabase
      .from("onboarding_forms")
      .update({ status, review_notes: notes || null, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`KYC ${status}`);
    setSelected(null);
    setNotes("");
    load();
  }

  return (
    <>
      <PageHeader title="KYC Review" subtitle="Approve or decline submitted onboarding forms." />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Country</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Submitted</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-3 pr-4 font-medium">{r.full_legal_name ?? "—"}</td>
                  <td className="py-3 pr-4">{r.country_of_residence ?? "—"}</td>
                  <td className="py-3 pr-4">{r.phone ?? "—"}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={statusVariant(r.status) as any}>{r.status}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelected(r); setNotes(r.review_notes ?? ""); }}>
                        <Eye className="mr-1 h-4 w-4" /> Review
                      </Button>
                      <Button size="sm" variant="default" disabled={r.status === "approved" || busy}
                        onClick={() => decide(r.id, "approved")}>
                        <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" disabled={r.status === "rejected" || busy}
                        onClick={() => decide(r.id, "rejected")}>
                        <XCircle className="mr-1 h-4 w-4" /> Decline
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td className="py-10 text-center text-muted-foreground" colSpan={6}>No KYC records.</td></tr>
              )}
              {loading && (
                <tr><td className="py-10 text-center text-muted-foreground" colSpan={6}>Loading…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setNotes(""); } }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Details — {selected?.full_legal_name ?? "Applicant"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Status" value={selected.status} />
                <Field label="User ID" value={selected.user_id} />
                <Field label="Full Legal Name" value={selected.full_legal_name} />
                <Field label="Date of Birth" value={selected.date_of_birth} />
                <Field label="Gender" value={selected.gender} />
                <Field label="Nationality" value={selected.nationality} />
                <Field label="Country of Residence" value={selected.country_of_residence} />
                <Field label="Phone" value={selected.phone} />
                <Field label="Address" value={selected.address} />
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold">Identity Documents</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DocLink label="Ghana Card / ID Document" url={selected.id_document_url} />
                  <DocLink label="Passport" url={selected.passport_url} />
                  <DocLink label="Selfie" url={selected.selfie_url} />
                  <DocLink label="Utility Bill" url={selected.utility_bill_url} />
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold">Next of Kin</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Name" value={selected.nok_name} />
                  <Field label="Relationship" value={selected.nok_relationship} />
                  <Field label="Phone" value={selected.nok_phone} />
                  <Field label="Email" value={selected.nok_email} />
                  <Field label="Address" value={selected.nok_address} />
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold">Investment Profile</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Experience" value={selected.investment_experience} />
                  <Field label="Preferred Amount (USD)" value={selected.preferred_amount} />
                  <Field label="Risk Appetite" value={selected.risk_appetite} />
                  <Field label="Monthly Income" value={selected.monthly_income} />
                  <Field label="Betting Platform" value={selected.betting_platform} />
                  <Field label="Expected ROI" value={selected.expected_roi} />
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold">Agreement</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Signature" value={selected.signature} />
                  <Field label="Terms Accepted" value={selected.terms_accepted ? "Yes" : "No"} />
                  <Field label="Submitted At" value={selected.submitted_at} />
                  <Field label="Reviewed At" value={selected.reviewed_at} />
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Review Notes</p>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes for the applicant…" />
              </section>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="destructive" disabled={busy || !selected} onClick={() => selected && decide(selected.id, "rejected")}>
              <XCircle className="mr-1 h-4 w-4" /> Decline
            </Button>
            <Button disabled={busy || !selected} onClick={() => selected && decide(selected.id, "approved")}>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Route = createFileRoute("/admin/kyc")({ component: Page });
