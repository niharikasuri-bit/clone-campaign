import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
import { AppShell, Breadcrumb } from "@/components/app-shell";
import { CloneCampaignDialog } from "@/components/clone-campaign-dialog";
import { useOverlayLoader } from "@/components/loader";
import { primaryButtonClass } from "@/components/flow-controls";

export default function CloneCampaign() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const withLoader = useOverlayLoader();

  async function clone(dates) {
    setOpen(false);
    await withLoader("Cloning campaign", () => navigate("/campaign-setup", { state: { ...dates, justCloned: true } }));
  }

  return (
    <AppShell>
      <main className="min-w-0 flex-1 px-6 pb-12 pt-4">
        <div className="mx-auto max-w-5xl">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Clone Campaign" }]} />
          <h1 className="mt-4 text-2xl font-bold text-heading">Clone Campaign</h1>
          <section className="mt-5 flex items-center justify-between gap-4 rounded-sm border border-border bg-card px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-heading">Campaign Name 1</h2>
              <p className="mt-1 text-xs text-muted-foreground">Seasonal Malaria Chemoprevention (SMC) · Multiround</p>
            </div>
            <button onClick={() => setOpen(true)} className={`flex items-center gap-2 ${primaryButtonClass}`}>
              <Copy className="size-4" /> Clone Campaign
            </button>
          </section>
        </div>
      </main>
      <CloneCampaignDialog open={open} onOpenChange={setOpen} onClone={clone} />
    </AppShell>
  );
}
