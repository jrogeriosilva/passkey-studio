import { ShieldCheck } from "lucide-react"
import { DEMO_URL, REPO_URL, WEBAUTHN_SPEC_URL } from "@/lib/links"

const LINKS = [
  { label: "Source on GitHub", href: REPO_URL },
  { label: "FIDO2 demo", href: DEMO_URL },
  { label: "WebAuthn spec", href: WEBAUTHN_SPEC_URL },
]

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-success" />
          No payload data ever leaves your browser.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
