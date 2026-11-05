import { Fingerprint } from "lucide-react"

const SUPPORTED_INPUTS = ["base64url", "hex", "raw CBOR", "PublicKeyCredential JSON"]

export function HeroIntro() {
  return (
    <section id="top" className="scroll-mt-14 pt-10 pb-8 sm:pt-14 sm:pb-10">
      <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        <Fingerprint className="size-3.5 text-primary" />
        FIDO2 · WebAuthn · CBOR
      </p>
      <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Decode and diagnose <span className="text-gradient">WebAuthn payloads</span>
      </h1>
      <p className="mt-3 max-w-2xl text-base text-pretty text-muted-foreground">
        Paste an <span className="text-foreground/90">attestationObject</span>,{" "}
        <span className="text-foreground/90">authenticatorData</span>,{" "}
        <span className="text-foreground/90">clientDataJSON</span> or a full{" "}
        <span className="text-foreground/90">PublicKeyCredential</span> response. Every field is
        parsed into an interactive tree, locally, and nothing leaves your device.
      </p>
      <ul className="mt-5 flex flex-wrap items-center gap-2" aria-label="Supported input formats">
        <li className="text-xs text-muted-foreground">Accepts</li>
        {SUPPORTED_INPUTS.map((label) => (
          <li
            key={label}
            className="rounded-md border border-border bg-card/60 px-2 py-1 font-mono text-[11px] text-foreground/80"
          >
            {label}
          </li>
        ))}
      </ul>
    </section>
  )
}
