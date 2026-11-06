const SUPPORTED_INPUTS = ["base64url", "hex", "raw CBOR", "PublicKeyCredential JSON"]

export function HeroIntro() {
  return (
    <section id="top" className="scroll-mt-14 pt-7 pb-6 sm:pt-8 sm:pb-7">
      <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        Decode and diagnose WebAuthn payloads
      </h1>
      <p className="mt-3 max-w-2xl text-base text-pretty text-muted-foreground">
        Paste an <span className="text-foreground/90">attestationObject</span>,{" "}
        <span className="text-foreground/90">authenticatorData</span>,{" "}
        <span className="text-foreground/90">clientDataJSON</span> or a full{" "}
        <span className="text-foreground/90">PublicKeyCredential</span> response. Every field is
        parsed into an interactive tree, locally, and nothing leaves your device.
      </p>
      <ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Supported input formats">
        <li className="text-xs text-muted-foreground">Accepts</li>
        {SUPPORTED_INPUTS.map((label) => (
          <li
            key={label}
            className="font-mono text-xs text-foreground/80"
          >
            {label}
          </li>
        ))}
      </ul>
    </section>
  )
}
