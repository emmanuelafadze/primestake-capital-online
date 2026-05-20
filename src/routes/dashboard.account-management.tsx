import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useGeo, formatLocal, formatUSD } from "@/lib/geo";
import { payWithPaystack } from "@/lib/paystack";
import { toast } from "sonner";
import { Briefcase, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/account-management")({ component: AM });

const STEPS = ["Personal", "Identity", "Next of Kin", "Investment", "Confirm"];

function AM() {
  const { user } = useAuth(); const geo = useGeo();
  const [form, setForm] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [invest, setInvest] = useState(500);
  const [wd, setWd] = useState({ amount: 0, destination: "" });

  const load = () => user && supabase.from("onboarding_forms").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => setForm(data ?? {}));
  useEffect(() => { load(); }, [user]);

  if (!form) return null;
  const status = form.status ?? "not_started";
  const approved = status === "approved";

  const save = async (patch: any, newStatus?: string) => {
    setBusy(true);
    const upsert = { user_id: user!.id, ...form, ...patch, ...(newStatus ? { status: newStatus, submitted_at: new Date().toISOString() } : {}) };
    delete upsert.id; delete upsert.created_at; delete upsert.updated_at;
    const { error } = await supabase.from("onboarding_forms").upsert(upsert, { onConflict: "user_id" });
    setBusy(false);
    if (error) return toast.error(error.message);
    setForm({ ...form, ...patch, ...(newStatus ? { status: newStatus } : {}) });
  };

  const doInvest = async () => {
    if (!user || invest < 1) return;
    setBusy(true);
    try {
      await payWithPaystack({
        email: user.email!, userId: user.id, amountUsd: invest,
        localCurrency: geo.currency, localAmount: invest * geo.rate, purpose: "investment",
        onSuccess: () => toast.success("Investment recorded."),
      });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const requestWd = async () => {
    if (!user || wd.amount < 1) return;
    const { error } = await supabase.from("withdrawals").insert({ user_id: user.id, amount_usd: wd.amount, destination: wd.destination, status: "pending" });
    if (error) return toast.error(error.message);
    toast.success("Withdrawal request submitted for review.");
    setWd({ amount: 0, destination: "" });
  };

  return (
    <>
      <PageHeader title="Account Management"
        subtitle="A managed program for serious capital. Complete KYC, deposit funds, and let our desk operate positions on your behalf." />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="KYC status" value={<span className="capitalize">{status.replace(/_/g, " ")}</span>} icon={<ShieldCheck className="h-4 w-4" />} />
        <StatCard label="Managed balance" value="—" icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Estimated ROI" value="—" />
      </div>

      {!approved && (
        <Panel title={`Onboarding — Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
          <div className="mb-6 flex gap-2">
            {STEPS.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-foreground" : "bg-border"}`} />)}
          </div>

          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Full legal name" value={form.full_legal_name ?? ""} onChange={(v) => setForm({ ...form, full_legal_name: v })} />
              <Input label="Date of birth" type="date" value={form.date_of_birth ?? ""} onChange={(v) => setForm({ ...form, date_of_birth: v })} />
              <Input label="Nationality" value={form.nationality ?? ""} onChange={(v) => setForm({ ...form, nationality: v })} />
              <Input label="Country of residence" value={form.country_of_residence ?? geo.country} onChange={(v) => setForm({ ...form, country_of_residence: v })} />
              <Input label="Phone" value={form.phone ?? ""} onChange={(v) => setForm({ ...form, phone: v })} />
              <Input label="Residential address" value={form.address ?? ""} onChange={(v) => setForm({ ...form, address: v })} />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Upload clear copies of your verification documents.</p>
              <FileUpload label="Government ID" field="id_document_url" form={form} setForm={setForm} userId={user!.id} />
              <FileUpload label="Passport (optional)" field="passport_url" form={form} setForm={setForm} userId={user!.id} />
              <FileUpload label="Selfie holding ID" field="selfie_url" form={form} setForm={setForm} userId={user!.id} />
              <FileUpload label="Utility bill (proof of address)" field="utility_bill_url" form={form} setForm={setForm} userId={user!.id} />
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="NOK full name" value={form.nok_name ?? ""} onChange={(v) => setForm({ ...form, nok_name: v })} />
              <Input label="Relationship" value={form.nok_relationship ?? ""} onChange={(v) => setForm({ ...form, nok_relationship: v })} />
              <Input label="Phone" value={form.nok_phone ?? ""} onChange={(v) => setForm({ ...form, nok_phone: v })} />
              <Input label="Email" type="email" value={form.nok_email ?? ""} onChange={(v) => setForm({ ...form, nok_email: v })} />
              <Input label="Address" value={form.nok_address ?? ""} onChange={(v) => setForm({ ...form, nok_address: v })} />
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Investment experience" value={form.investment_experience ?? ""} onChange={(v) => setForm({ ...form, investment_experience: v })} />
              <Input label="Preferred amount (USD)" type="number" value={form.preferred_amount ?? ""} onChange={(v) => setForm({ ...form, preferred_amount: v })} />
              <Input label="Risk appetite" value={form.risk_appetite ?? ""} onChange={(v) => setForm({ ...form, risk_appetite: v })} />
              <Input label="Monthly income" value={form.monthly_income ?? ""} onChange={(v) => setForm({ ...form, monthly_income: v })} />
              <Input label="Betting platform" value={form.betting_platform ?? ""} onChange={(v) => setForm({ ...form, betting_platform: v })} />
              <Input label="Expected ROI" value={form.expected_roi ?? ""} onChange={(v) => setForm({ ...form, expected_roi: v })} />
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">By submitting you acknowledge market risk and authorize PrimeStake Capital to operate positions on your behalf within agreed parameters.</p>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={!!form.terms_accepted} onChange={(e) => setForm({ ...form, terms_accepted: e.target.checked })} className="mt-1" />
                I accept the terms, risk disclosures, and managed-betting authorization.
              </label>
              <Input label="Digital signature (type full name)" value={form.signature ?? ""} onChange={(v) => setForm({ ...form, signature: v })} />
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded-full border border-border px-5 py-2.5 text-sm disabled:opacity-40">Back</button>
            {step < STEPS.length - 1 ? (
              <button onClick={async () => { await save({}); setStep(step + 1); }} className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">Save & continue</button>
            ) : (
              <button disabled={busy || !form.terms_accepted} onClick={() => save({}, "pending")} className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50">
                {busy ? "Submitting…" : "Submit for review"}
              </button>
            )}
          </div>
        </Panel>
      )}

      {status === "pending" || status === "under_review" ? (
        <Panel>
          <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5" />
            <div><p className="font-medium">Submitted for compliance review</p><p className="text-sm text-muted-foreground">You'll be notified once your KYC is approved.</p></div>
          </div>
        </Panel>
      ) : null}

      {approved && (
        <>
          <Panel title="Place investment">
            <div className="flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Amount (USD)</span>
                <input type="number" min={1} value={invest} onChange={(e) => setInvest(Number(e.target.value))}
                  className="mt-2 w-48 rounded-lg border border-input bg-background px-4 py-3 text-sm" />
              </label>
              <p className="text-sm text-muted-foreground">≈ {formatLocal(invest, geo)}</p>
              <button disabled={busy} onClick={doInvest} className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Invest via Paystack
              </button>
            </div>
          </Panel>

          <Panel title="Request withdrawal">
            <div className="flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Amount (USD)</span>
                <input type="number" min={1} value={wd.amount} onChange={(e) => setWd({ ...wd, amount: Number(e.target.value) })}
                  className="mt-2 w-48 rounded-lg border border-input bg-background px-4 py-3 text-sm" />
              </label>
              <label className="block flex-1 min-w-[240px]">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Destination (bank / wallet)</span>
                <input value={wd.destination} onChange={(e) => setWd({ ...wd, destination: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm" />
              </label>
              <button onClick={requestWd} className="inline-flex h-11 items-center rounded-full border border-foreground px-6 text-sm font-medium">Request</button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">All withdrawals are reviewed by our operations team before release.</p>
          </Panel>
        </>
      )}
    </>
  );
}

function Input({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none" />
    </label>
  );
}

function FileUpload({ label, field, form, setForm, userId }: any) {
  const upload = async (f: File) => {
    const path = `${userId}/${field}_${Date.now()}_${f.name}`;
    const { error } = await supabase.storage.from("kyc-documents").upload(path, f, { upsert: true });
    if (error) return toast.error(error.message);
    setForm({ ...form, [field]: path });
    toast.success(`${label} uploaded`);
  };
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{form[field] ? "✓ Uploaded" : "No file"}</p>
      <input type="file" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} className="mt-2 text-xs" />
    </div>
  );
}
