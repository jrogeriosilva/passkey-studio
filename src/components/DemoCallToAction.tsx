import { ExternalLink, KeyRound } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { DEMO_URL } from "@/lib/links"

export function DemoCallToAction() {
  return (
    <section
      aria-labelledby="demo-cta-heading"
      className="relative overflow-hidden rounded-xl border border-primary/25 bg-card p-5 shadow-sm shadow-black/20 sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-24 size-72 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/25 to-primary/5 text-primary ring-1 ring-primary/30">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h2 id="demo-cta-heading" className="text-base font-semibold tracking-tight">
              New to FIDO2? See the protocol in action.
            </h2>
            <p className="max-w-xl text-sm text-pretty text-muted-foreground">
              Walk through registration and authentication step by step — challenge, attestation
              and assertion — in an interactive demo.
            </p>
          </div>
        </div>
        <a
          href={DEMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({
            size: "lg",
            className: "gap-1.5 self-start px-4 shadow-lg shadow-primary/20 sm:self-auto",
          })}
        >
          Try the FIDO2 demo
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
