import { buttonVariants } from "@/components/ui/button"
import { GithubIcon } from "@/components/GithubIcon"
import { REPO_URL } from "@/lib/links"

export function AppHeader() {
  return (
    <header className="suite-header">
      <div className="suite-header-inner">
        <a href="#top" className="suite-brand"><span className="suite-mark" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg></span><span className="suite-brand-copy"><span className="suite-title">WebAuthn Decoder</span><span className="suite-subtitle">FIDO2 · WebAuthn</span></span></a>
        <div className="suite-actions">
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
