import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowDown, ArrowRight, ClipboardList, CloudUpload, Fingerprint, ListChecks, MapPinned, PackagePlus, Pencil, Info, Check } from "lucide-react";
import { AppShell, Breadcrumb, FlowFooter } from "@/components/app-shell";
import { useOverlayLoader } from "@/components/loader";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const DELIVERY_COPY =
  "Add key details about how the resources will be delivered. This includes setting the delivery dates, the number of cycles and rounds, and any rules or conditions that need to be followed. These settings help make sure the campaign runs smoothly and reaches the right people at the right time.";

const TASKS = [
  {
    icon: MapPinned,
    title: "Select your Boundaries for the campaign",
    description:
      "Select the boundaries where you want to run the campaign. The areas you choose will determine where facilities and resources are allocated and how the campaign activities are planned.",
    action: "Select Boundaries",
  },
  { key: "delivery", icon: PackagePlus, title: "Define your Delivery Strategy", description: DELIVERY_COPY, action: "Start Planning Deliveries" },
  {
    icon: ClipboardList,
    title: "Setup your mobile app",
    description: "Configure your mobile app to fit campaign needs. Create and manage forms, customize the interface, choose features and adjust key settings.",
    action: "Setup your App",
  },
  { key: "microplan", icon: CloudUpload, title: "Upload Data", description: DELIVERY_COPY, action: "Upload Data" },
  {
    icon: Fingerprint,
    title: "Configure Attendance",
    description: "Set up attendance for your campaign by marking non-working days, selecting how attendance will be captured, and creating registers to map users.",
    action: "Setup Attendance",
  },
  { icon: ListChecks, title: "Define Checklists", description: DELIVERY_COPY, action: "Define Checklists", disabled: true },
];

/** What to do after cloning, in order (same pattern as the upload screen's "How to proceed" steps). */
const NEXT_STEPS = [
  {
    key: "delivery",
    title: "Edit the delivery strategy",
    text: "Edit the strategy to update the delivery details with the new dates and current campaign requirements.",
  },
  {
    key: "microplan",
    title: "Upload the edited microplan",
    text: "Update the microplan with the changes you made to the delivery strategy, then upload the edited file.",
  },
];

/** Steps that must be done before a cloned campaign can be created. */
const MANDATORY = ["delivery", "microplan"];
const STORE_KEY = "clonedCampaign";

const DEFAULT_DATES = "21 August - 30 August, 2025";

function formatRange(start, end) {
  if (!start || !end) return DEFAULT_DATES;
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const dm = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  return s.getFullYear() === e.getFullYear()
    ? `${dm(s)} - ${dm(e)}, ${e.getFullYear()}`
    : `${dm(s)}, ${s.getFullYear()} - ${dm(e)}, ${e.getFullYear()}`;
}

/** Step cards joined by arrows (as on the attendance upload screen), in white on the blue info tint. */
function StepCards({ compact = false, done = {} }) {
  return (
    <ol className={`flex flex-col items-stretch gap-1.5 ${compact ? "" : "md:flex-row md:items-center"}`}>
      {NEXT_STEPS.map(({ key, title, text }, i) => (
        <li key={title} className="contents">
          {i > 0 && (
            <span className="flex shrink-0 items-center justify-center text-muted-foreground/60" aria-hidden="true">
              {!compact && <ArrowRight className="hidden size-4 md:block" />}
              <ArrowDown className={`size-4 ${compact ? "" : "md:hidden"}`} />
            </span>
          )}
          <div className={`flex flex-1 items-start gap-2.5 self-stretch rounded-md border border-border px-3 py-2 text-left ${compact ? "bg-info-bg" : "bg-card"}`}>
            {done[key] ? (
              <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-green-700 text-white" aria-hidden="true">
                <Check className="size-3" strokeWidth={3} />
              </span>
            ) : (
              <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-[#fbeee8] text-[11px] font-bold text-primary" aria-hidden="true">
                {i + 1}
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-5 text-heading">
                <span className="sr-only">Step {i + 1}: </span>
                {title}
                {done[key] && <span className="sr-only"> (done)</span>}
              </span>
              {!compact && <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{text}</span>}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Guidance panel above the task cards: lightest blue (#e8f1fb, as the Process Flow Designer) with numbered step cards. */
function NextSteps({ done }) {
  return (
    <section role="note" aria-labelledby="next-steps-title" className="mt-4 rounded-md border border-[#c7dbf0] bg-[#e8f1fb] px-4 py-3">
      <h2 id="next-steps-title" className="flex items-center gap-2 text-base font-bold text-heading">
        <Info className="size-[18px] shrink-0 text-[#0b4b66]" aria-hidden="true" />
        To create your cloned campaign, complete these 2 steps
      </h2>
      <div className="mt-3">
        <StepCards done={done} />
      </div>
    </section>
  );
}

/** Success popup, same as the attendance app's "Template Generated" popups: icon, title, message, one CTA. */
function ClonedSuccessDialog({ open, onOpenChange, name }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[28rem] gap-0 overflow-hidden rounded-xl bg-card p-0 shadow-xl sm:rounded-xl">
        <div className="px-8 pb-1 pt-8 text-center">
          <div className="success-pop mx-auto flex size-14 items-center justify-center rounded-full bg-green-700 ring-8 ring-green-100">
            <svg viewBox="0 0 24 24" className="size-7 text-white" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path className="success-check" d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <DialogTitle className="mt-5 font-condensed text-2xl font-bold text-heading">Campaign cloned successfully</DialogTitle>
        </div>
        <div className="p-6">
          <DialogDescription className="text-center text-sm leading-relaxed text-muted-foreground">
            Your campaign <strong className="font-semibold text-foreground">{name}</strong> has been cloned successfully. To proceed with creating your campaign, you will have to edit your{" "}
            <strong className="font-semibold text-foreground">delivery strategy</strong> and update the <strong className="font-semibold text-foreground">microplan</strong> based on that.
          </DialogDescription>
          <button
            autoFocus
            onClick={() => onOpenChange(false)}
            className="mt-6 flex h-8 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function loadClone(state) {
  if (state?.justCloned) {
    const fresh = { name: state.name, start: state.start, end: state.end, done: {} };
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(fresh));
    } catch {}
    return fresh;
  }
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY)) ?? null;
  } catch {
    return null;
  }
}

export default function CampaignSetup() {
  const { state } = useLocation();
  const withLoader = useOverlayLoader();
  // The clone is kept for the session so the steps and the locked footer survive a refresh.
  const [clone, setClone] = useState(() => loadClone(state));
  const cloned = !!clone;
  const [successOpen, setSuccessOpen] = useState(!!state?.justCloned);
  const done = clone?.done ?? {};
  const remaining = MANDATORY.filter((k) => !done[k]).length;
  const canCreate = !cloned || remaining === 0;

  // Clear the one-time clone hand-off so a refresh keeps progress instead of starting the clone again.
  const navigate = useNavigate();
  useEffect(() => {
    if (state?.justCloned) navigate(".", { replace: true, state: null });
  }, [state, navigate]);

  useEffect(() => {
    if (!clone) return;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(clone));
    } catch {}
  }, [clone]);

  // Prototype: opening a mandatory task stands in for completing it.
  async function openTask(task) {
    if (!cloned || !MANDATORY.includes(task.key) || done[task.key]) return;
    const text = task.key === "delivery" ? "Updating delivery strategy" : "Uploading microplan";
    await withLoader(text, () => setClone((c) => ({ ...c, done: { ...c.done, [task.key]: true } })));
  }

  async function createCampaign() {
    if (!canCreate) return;
    await withLoader("Creating campaign");
  }

  return (
    <AppShell>
      <main className="min-w-0 flex-1 px-6 pb-28 pt-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between text-xs">
            <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Module selection" }]} />
          </div>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-heading">
                {clone?.name || "Campaign Name 1"}
                <Pencil className="size-4 text-primary" />
              </h1>
              <p className="mt-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                {formatRange(clone?.start, clone?.end)}
                <Pencil className="size-3 text-primary" />
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-sm border border-primary/60 bg-primary/5 px-3 py-1.5 text-xs text-primary">Seasonal Malaria Chemoprevention (SMC)</span>
              <span className="rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-heading">Multiround</span>
            </div>
          </div>

          <p className="mt-4 max-w-4xl text-xs leading-relaxed text-muted-foreground">
            Complete the tasks below one by one to set up your campaign. Your progress will be saved as a draft until you click <strong className="font-semibold">Create Campaign</strong>. You can
            edit these details anytime before the campaign begins.
          </p>

          {cloned && <NextSteps done={done} />}

          <div className="mt-5 space-y-3">
            {TASKS.map((task) => {
              const mandatory = cloned && MANDATORY.includes(task.key);
              const isDone = mandatory && done[task.key];
              const highlight = mandatory && !isDone;
              const buttonClass = `w-[190px] shrink-0 rounded-sm px-4 py-2 text-center text-xs font-medium transition-colors ${
                task.disabled ? "cursor-not-allowed bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:brightness-95"
              }`;
              return (
                <section
                  key={task.title}
                  className={`rounded-sm border bg-card px-5 py-4 ${highlight ? "border-primary/60" : "border-border"} ${task.disabled ? "opacity-70" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <task.icon className={`size-6 shrink-0 ${task.disabled ? "text-muted-foreground" : "text-primary"}`} strokeWidth={1.75} />
                      <h2 className={`text-base font-bold ${task.disabled ? "text-muted-foreground" : "text-heading"}`}>{task.title}</h2>
                      {mandatory &&
                        (isDone ? (
                          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            <Check className="size-3" strokeWidth={3} aria-hidden="true" /> Updated
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#fbeee8] px-2.5 py-0.5 text-xs font-medium text-primary">Mandatory</span>
                        ))}
                    </div>
                    <button disabled={task.disabled} onClick={() => void openTask(task)} className={buttonClass}>
                      {task.action}
                    </button>
                  </div>
                  <p className="mt-3 max-w-4xl text-xs leading-relaxed text-muted-foreground">{task.description}</p>
                </section>
              );
            })}
          </div>
        </div>
      </main>
      <FlowFooter>
        <span />
        <div className="group relative">
          <button
            onClick={() => void createCampaign()}
            aria-disabled={!canCreate}
            aria-describedby={canCreate ? undefined : "create-campaign-tip"}
            className={`h-10 rounded-md px-6 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              canCreate ? "bg-primary text-primary-foreground hover:brightness-95" : "cursor-not-allowed bg-muted text-muted-foreground"
            }`}
          >
            Create Campaign
          </button>
          {!canCreate && (
            <div
              id="create-campaign-tip"
              role="tooltip"
              className="pointer-events-none invisible absolute bottom-full right-0 mb-2 w-64 rounded-md bg-[#363636] px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
            >
              Edit the delivery strategy and upload the edited microplan to create this campaign.
              <span className="absolute right-6 top-full border-x-[6px] border-t-[6px] border-x-transparent border-t-[#363636]" aria-hidden="true" />
            </div>
          )}
        </div>
      </FlowFooter>
      <ClonedSuccessDialog open={successOpen} onOpenChange={setSuccessOpen} name={clone?.name || "Campaign Name 1"} />
    </AppShell>
  );
}
