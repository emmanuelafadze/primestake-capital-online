import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

type Kyc = any;

function Page() {
  const [rows, setRows] = useState<Kyc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Kyc | null>(null);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("onboarding_forms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setRows([]);
    } else {
      setRows(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <PageHeader
        title="KYC Review"
        subtitle="Manage onboarding requests"
      />

      <Panel>
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center">No records found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Country</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.full_legal_name || "-"}</td>
                    <td>{r.country_of_residence || "-"}</td>

                    <td>
                      <Badge>
                        {r.status || "pending"}
                      </Badge>
                    </td>

                    <td>
                      <Button
                        size="sm"
                        onClick={() => setSelected(r)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Dialog
        open={!!selected}
        onOpenChange={() => setSelected(null)}
      >
        <DialogContent>
          <pre className="overflow-auto text-sm">
            {JSON.stringify(selected, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Route =
  createFileRoute("/admin/kyc")({
    component: Page,
  });
