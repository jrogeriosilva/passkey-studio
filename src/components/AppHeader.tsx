import { LockKeyhole, ShieldCheck } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { GithubIcon } from "@/components/GithubIcon"
import { REPO_URL } from "@/lib/links"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href="#top"
          className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/25">
            <LockKeyhole className="size-4" />
          </span>
          <span className="flex flex-col">
            <span className="text-[15px] leading-tight font-semibold tracking-tight">WebAuthn Decoder</span>
            <span className="hidden text-[11px] leading-tight text-muted-foreground sm:block">
              FIDO2 · CBOR · COSE
            </span>
          </span>
        </a>

        <div className="flex items-center gap-1.5">
          <span className="hidden items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-xs font-medium text-success sm:inline-flex">
            <ShieldCheck className="size-3.5" />
            Runs 100% in your browser
          </span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <GithubIcon className="size-4" />
          </a>
        </div>
      </div>
    </header>
  )
}
