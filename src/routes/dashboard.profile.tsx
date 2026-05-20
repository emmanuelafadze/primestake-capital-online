import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({ component: P });
function P() {
  const { user } = useAuth(); const [profile, setProfile] = useState<any>({});
  useEffect(() => { user && supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data ?? {})); }, [user]);
  const save = async () => {
    const { error } = await supabase.from("profiles").update({ full_name: profile.full_name, phone: profile.phone, country: profile.country }).eq("id", user!.id);
    if (error) return toast.error(error.message);
    toast.success("Profile saved.");
  };
  return (
    <>
      <PageHeader title="Profile" />
      <Panel>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" value={profile.full_name ?? ""} onChange={(v: string) => setProfile({ ...profile, full_name: v })} />
          <Field label="Email" value={profile.email ?? ""} onChange={() => {}} disabled />
          <Field label="Phone" value={profile.phone ?? ""} onChange={(v: string) => setProfile({ ...profile, phone: v })} />
          <Field label="Country" value={profile.country ?? ""} onChange={(v: string) => setProfile({ ...profile, country: v })} />
        </div>
        <button onClick={save} className="mt-6 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background">Save changes</button>
      </Panel>
    </>
  );
}
function Field({ label, value, onChange, disabled = false }: any) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm disabled:opacity-60" />
    </label>
  );
}
