import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

/* Styling follows the Process Flow Designer (workflow-designer/styles.css):
   .modal / .modal__head / .modal__foot, .nf-box, .nf-row (label left, field right),
   .digit-label and the DIGIT 40px text input. */
const BLUE = "text-[#0b4b66]";
const inputClass =
  "block h-10 w-full rounded-[4px] border border-[#787878] bg-white px-3 text-base leading-6 text-[#363636] placeholder:text-[#5e5e5e] outline-none focus:border-[1.5px] focus:border-primary aria-invalid:border-[1.5px] aria-invalid:border-[#b91900]";

function Row({ id, label, error, children }) {
  return (
    <div className="grid gap-x-4 gap-y-1 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-start">
      <div className="flex min-h-6 items-center gap-1 sm:min-h-10">
        <label htmlFor={id} className={`text-base font-bold ${BLUE}`}>
          {label} <span className="text-[#b91900]">*</span>
        </label>
      </div>
      <div className="grid min-w-0 gap-1">
        {children}
        {error && (
          <p id={`${id}-error`} className="text-sm font-medium text-[#b91900]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/** Popup to clone a campaign: the user names it and sets the new campaign start and end dates. */
export function CloneCampaignDialog({ open, onOpenChange, onClone }) {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const nameError = submitted && !name.trim() ? "Enter a campaign name" : null;
  const startError = submitted && !start ? "Select a campaign start date" : null;
  const endError = submitted && !end ? "Select a campaign end date" : start && end && end < start ? "The end date must be on or after the start date" : null;

  function submit(e) {
    e.preventDefault();
    setSubmitted(true);
    if (!name.trim() || !start || !end || end < start) return;
    onClone({ name: name.trim(), start, end });
  }

  function change(next) {
    if (!next) {
      setName("");
      setStart("");
      setEnd("");
      setSubmitted(false);
    }
    onOpenChange(next);
  }

  const field = (id, error) => ({ id, "aria-invalid": !!error, "aria-describedby": error ? `${id}-error` : undefined, className: inputClass });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={change}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(20,20,20,0.45)] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-48px)] w-[min(720px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-white text-[#363636] shadow-[0_12px_40px_rgba(0,0,0,0.18)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <form onSubmit={submit} noValidate className="flex min-h-0 flex-col">
            <div className="flex items-start justify-between gap-4 px-6 pb-3 pt-5">
              <div>
                <DialogPrimitive.Title className={`mb-1 text-2xl font-bold leading-[1.3] ${BLUE}`}>Clone Campaign</DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-base leading-normal text-[#5e5e5e]">
                  Add the campaign name, start date and end date for the new campaign.
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close
                aria-label="Close"
                className="flex size-9 shrink-0 items-center justify-center rounded-[4px] text-[#363636] hover:bg-[#eeeeee] focus-visible:shadow-[0_0_0_3px_#fff,0_0_0_5px_var(--primary)] focus-visible:outline-none"
              >
                <X className="size-5" />
              </DialogPrimitive.Close>
            </div>

            <div className="overflow-y-auto px-6 py-4">
              <div className="grid gap-5">
                <Row id="campaign-name" label="Campaign name" error={nameError}>
                  <input {...field("campaign-name", nameError)} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter campaign name" autoComplete="off" />
                </Row>
                <Row id="campaign-start" label="Campaign start date" error={startError}>
                  <input {...field("campaign-start", startError)} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                </Row>
                <Row id="campaign-end" label="Campaign end date" error={endError}>
                  <input {...field("campaign-end", endError)} type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} />
                </Row>
              </div>
            </div>

            <div className="flex justify-end gap-2 rounded-b-xl bg-white px-6 pb-5 pt-2">
              <button
                type="button"
                onClick={() => change(false)}
                className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-primary bg-white px-4 font-medium text-primary transition-colors hover:bg-[#fbeee8]"
              >
                Cancel
              </button>
              <button type="submit" className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-transparent bg-primary px-4 font-medium text-white transition-colors hover:bg-[#a63f0b]">
                Clone Campaign
              </button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
