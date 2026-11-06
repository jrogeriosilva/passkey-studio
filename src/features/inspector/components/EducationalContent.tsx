import { useEffect, useState, useRef, type ReactNode } from "react"
import { BookOpen, Check, ChevronDown, ShieldCheck, X, ZoomIn } from "lucide-react"
import lifecycleImg from "@/inspector/assets/fido2-webauthn-diagrams-dark/01-webauthn-credential-lifecycle-dark.svg"
import anatomyImg from "@/inspector/assets/fido2-webauthn-diagrams-dark/02-publickeycredential-anatomy-dark.svg"
import authdataImg from "@/inspector/assets/fido2-webauthn-diagrams-dark/03-authenticatordata-byte-layout-dark.svg"
import attestationImg from "@/inspector/assets/fido2-webauthn-diagrams-dark/04-attestationobject-structure-dark.svg"

/* ---------------------------------------------------------------------------
 * Small presentational helpers shared by every section below.
 * ------------------------------------------------------------------------- */

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5 font-mono text-[0.82em] text-foreground/90">
      {children}
    </code>
  )
}

function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-medium text-foreground">{children}</strong>
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-20 space-y-4">
      <h3 id={id} className="flex items-center gap-3 text-xl font-semibold tracking-tight">
        <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-primary" />
        {title}
      </h3>
      {children}
    </section>
  )
}

function Prose({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-pretty text-muted-foreground">{children}</p>
}

function Bullets({ items, gap = "space-y-2" }: { items: ReactNode[]; gap?: string }) {
  return (
    <ul className={`max-w-3xl list-disc pl-5 text-muted-foreground marker:text-primary/70 ${gap}`}>
      {items.map((item, i) => (
        <li key={i} className="pl-1">
          {item}
        </li>
      ))}
    </ul>
  )
}

function DefinitionRows({ items }: { items: [string, string][] }) {
  return (
    <dl className="max-w-3xl divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card/40">
      {items.map(([term, def]) => (
        <div key={term} className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-4">
          <dt className="font-mono text-xs font-medium text-tree-key">{term}</dt>
          <dd className="text-muted-foreground">{def}</dd>
        </div>
      ))}
    </dl>
  )
}

type LightboxState = { src: string; alt: string } | null

function DiagramFigure({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  const [lightbox, setLightbox] = useState<LightboxState>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (lightbox) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [lightbox])

  return (
    <figure className="max-w-3xl overflow-hidden rounded-xl border border-border bg-card/60 shadow-sm shadow-black/20">
      <button
        type="button"
        onClick={() => setLightbox({ src, alt })}
        aria-label={`Enlarge diagram: ${caption}`}
        className="group/figure relative block w-full cursor-zoom-in p-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <img src={src} alt={alt} className="w-full rounded-lg" loading="lazy" />
        <span className="pointer-events-none absolute top-4 right-4 inline-flex items-center gap-1 rounded-md border border-border bg-background/80 px-2 py-1 text-[11px] text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover/figure:opacity-100 group-focus-visible/figure:opacity-100">
          <ZoomIn className="size-3" aria-hidden="true" />
          Enlarge
        </span>
      </button>
      <figcaption className="border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
        {caption}
      </figcaption>
      <dialog ref={dialogRef} aria-label={caption} onCancel={() => setLightbox(null)}
        onClick={e => { if (e.target === e.currentTarget) setLightbox(null) }}
        className="diagram-dialog rounded-xl border border-border bg-card p-4 text-foreground backdrop:bg-black/80">
        <button type="button" aria-label="Close" onClick={() => setLightbox(null)} className="mb-3 min-h-11 px-3"><X className="size-4" /></button>
        {lightbox && <img src={lightbox.src} alt={lightbox.alt} className="max-h-[80vh] max-w-full rounded-lg" />}
      </dialog>
    </figure>
  )
}

function ScenarioCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="rounded-xl border border-border bg-card/40 p-4">
      <h4 className="font-medium text-foreground">{title}</h4>
      <p className="mt-1.5 text-pretty text-muted-foreground">{children}</p>
    </li>
  )
}

function Faq({ items }: { items: [string, string][] }) {
  return (
    <div className="max-w-3xl space-y-2">
      {items.map(([q, a]) => (
        <details
          key={q}
          className="group rounded-xl border border-border bg-card/40 open:bg-card/70 transition-colors"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-medium text-foreground outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset rounded-xl">
            {q}
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
            />
          </summary>
          <p className="px-4 pb-4 text-pretty text-muted-foreground">{a}</p>
        </details>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------- */

export function EducationalContent() {
  return (
    <details className="mt-10 border-t border-border py-6">
      <summary className="cursor-pointer py-3 text-lg font-semibold">Guide to WebAuthn payloads</summary>
    <article
      aria-labelledby="learn-heading"
      className="mt-16 space-y-12 border-t border-border/60 pt-12 pb-16 text-sm leading-relaxed"
    >
      <header className="space-y-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          <BookOpen className="size-3.5 text-primary" aria-hidden="true" />
          Learn
        </p>
        <h2 id="learn-heading" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Understanding FIDO2 and WebAuthn Payloads
        </h2>
        <p className="max-w-2xl text-base text-pretty text-muted-foreground">
          WebAuthn Decoder is a free, browser-based tool for decoding and inspecting WebAuthn protocol
          data. Whether you are integrating passkeys into a web application, debugging a failed
          registration, or auditing an authenticator's attestation statement, this tool decodes
          every layer — from the outer CBOR envelope down to the raw COSE key — without sending
          any data to a server. Everything runs locally in your browser.
        </p>
      </header>

      <Section id="what-is-fido2" title="What Is FIDO2?">
        <Prose>
          FIDO2 is the umbrella name for two complementary standards published by the FIDO Alliance
          and the World Wide Web Consortium (W3C): the <Strong>Web Authentication API (WebAuthn)</Strong> and
          the <Strong>Client to Authenticator Protocol 2 (CTAP2)</Strong>. Together they enable
          phishing-resistant, passwordless authentication — sometimes called passkeys — across
          browsers, operating systems, and hardware security keys.
        </Prose>
        <Prose>
          WebAuthn defines the JavaScript API that relying parties (websites) call, and the
          cryptographic data structures their servers must verify. CTAP2 defines how the browser
          communicates with an external authenticator such as a YubiKey, a phone, or a platform
          authenticator built into a laptop's TPM. WebAuthn Decoder focuses on the WebAuthn data
          structures that flow between the browser and the relying party server.
        </Prose>
      </Section>

      <Section id="lifecycle" title="The WebAuthn Credential Lifecycle">
        <DiagramFigure
          src={lifecycleImg}
          alt="Diagram showing the WebAuthn credential lifecycle: registration with navigator.credentials.create and authentication with navigator.credentials.get"
          caption="Registration creates a credential; authentication proves possession of it."
        />
        <Prose>WebAuthn has two distinct ceremony types, each producing a different payload shape:</Prose>
        <Bullets
          items={[
            <>
              <Strong>Registration</Strong> — the browser calls <Code>navigator.credentials.create()</Code> with
              a challenge from the server. The authenticator generates a new asymmetric key pair, signs
              the challenge, and returns a <Code>PublicKeyCredential</Code> whose <Code>response</Code> includes
              an <Code>attestationObject</Code> and a <Code>clientDataJSON</Code>. The server stores the public
              key for future authentications.
            </>,
            <>
              <Strong>Authentication</Strong> — the browser calls <Code>navigator.credentials.get()</Code> with
              a new server challenge. The authenticator signs the challenge with the private key it
              stored during registration and returns a <Code>PublicKeyCredential</Code> whose{" "}
              <Code>response</Code> includes an <Code>authenticatorData</Code>, a <Code>signature</Code>, and a{" "}
              <Code>clientDataJSON</Code>.
            </>,
          ]}
        />
      </Section>

      <Section id="anatomy" title="Anatomy of a PublicKeyCredential">
        <DiagramFigure
          src={anatomyImg}
          alt="Diagram showing the structure of a PublicKeyCredential object with fields: id, rawId, response.attestationObject, response.authenticatorData, response.clientDataJSON, response.signature, and response.userHandle"
          caption="Fields of the PublicKeyCredential returned by both ceremonies."
        />
        <Prose>
          The object returned by both WebAuthn ceremonies is a <Code>PublicKeyCredential</Code>. Its most
          important fields are:
        </Prose>
        <DefinitionRows
          items={[
            ["id / rawId", "A base64url-encoded (id) or raw ArrayBuffer (rawId) unique identifier for this credential."],
            ["response.attestationObject", "Registration only. A CBOR-encoded map containing fmt (attestation format), authData (authenticator data bytes), and attStmt (attestation statement). This is what you decode here to inspect a new credential."],
            ["response.authenticatorData", "Authentication only (also nested inside attestationObject during registration). Raw binary data — not CBOR — containing the RP ID hash, flags, sign count, and optional attested credential data."],
            ["response.clientDataJSON", "Base64url-encoded UTF-8 JSON bound to both ceremonies. Contains type, challenge, origin, and optionally crossOrigin and tokenBinding."],
            ["response.signature", "Authentication only. The authenticator's signature over authenticatorData ‖ SHA-256(clientDataJSON), using the private key registered earlier."],
            ["response.userHandle", "Authentication only. The opaque user ID set during registration, returned by the authenticator to help the server find the right account."],
          ]}
        />
      </Section>

      <Section id="attestation-object" title="Decoding the attestationObject">
        <DiagramFigure
          src={attestationImg}
          alt="Diagram showing the CBOR structure of attestationObject with keys: fmt, authData, and attStmt"
          caption="attestationObject is a CBOR map with three keys."
        />
        <Prose>
          The <Code>attestationObject</Code> is a CBOR-encoded map with three top-level keys:
        </Prose>
        <Bullets
          gap="space-y-1.5"
          items={[
            <><Code>fmt</Code> — a string identifying the attestation statement format.</>,
            <><Code>authData</Code> — the raw authenticator data bytes (described in the next section).</>,
            <><Code>attStmt</Code> — a CBOR map whose structure depends on <Code>fmt</Code>.</>,
          ]}
        />
        <Prose>Common <Code>fmt</Code> values and what they mean:</Prose>
        <Bullets
          gap="space-y-1.5"
          items={[
            <><Strong>none</Strong> — no attestation. The authenticator does not prove its model. Widely used for platform authenticators (Face ID, Windows Hello, Android biometrics) when the relying party does not need to verify device provenance.</>,
            <><Strong>packed</Strong> — a compact, general-purpose format defined by the WebAuthn spec. Used by most security keys and many platform authenticators.</>,
            <><Strong>fido-u2f</Strong> — legacy FIDO U2F compatibility format. Seen on older YubiKeys and keys manufactured before the FIDO2 standard.</>,
            <><Strong>tpm</Strong> — Trusted Platform Module attestation. Used by Windows Hello for Business when a TPM is present.</>,
            <><Strong>android-key</Strong> — Android Keystore attestation. Used on Android devices with hardware-backed key storage.</>,
            <><Strong>apple</Strong> — Apple Anonymous Attestation. Used by Touch ID, Face ID, and the iPhone Secure Enclave since iOS 14 / macOS 11.</>,
          ]}
        />
      </Section>

      <Section id="authenticator-data" title="Reading authenticatorData">
        <DiagramFigure
          src={authdataImg}
          alt="Diagram showing the byte layout of authenticatorData: rpIdHash (32 bytes), flags (1 byte), signCount (4 bytes), attestedCredentialData, and extensions"
          caption="Byte layout of authenticatorData. Only the COSE key inside it is CBOR."
        />
        <Prose>
          Unlike most other fields in WebAuthn, <Code>authenticatorData</Code> is not CBOR. It is a
          manually packed binary structure — you cannot run a CBOR decoder over it directly. Its
          layout is:
        </Prose>
        <Bullets
          gap="space-y-1.5"
          items={[
            <><Strong>Bytes 0–31</Strong> — rpIdHash: the SHA-256 hash of the Relying Party ID (usually the effective domain, e.g. <Code>example.com</Code>). The server must verify this matches its own RP ID.</>,
            <><Strong>Byte 32</Strong> — flags: a bitmask encoding user presence (UP, bit 0), user verification (UV, bit 2), backup eligibility (BE, bit 3), backup state (BS, bit 4), attested credential data included (AT, bit 6), and extension data included (ED, bit 7).</>,
            <><Strong>Bytes 33–36</Strong> — signCount: a 32-bit big-endian unsigned integer incremented by the authenticator on every authentication. A count lower than the server's stored value indicates a possible cloned authenticator.</>,
            <><Strong>Bytes 37+</Strong> — attestedCredentialData (only if AT flag set): a variable-length structure containing the AAGUID (16 bytes), credential ID length (2 bytes BE), credential ID, and a CBOR-encoded COSE public key.</>,
            <><Strong>Trailing bytes</Strong> — extensions CBOR map (only if ED flag set).</>,
          ]}
        />
        <Prose>
          WebAuthn Decoder parses this structure byte-by-byte, correctly separating the binary sections
          from the embedded CBOR so each field is labeled and highlighted individually in the tree.
        </Prose>
      </Section>

      <Section id="cose-keys" title="COSE Keys Explained">
        <Prose>
          WebAuthn represents public keys in the <Strong>CBOR Object Signing and Encryption (COSE)</Strong> format
          defined in RFC 8152. A COSE_Key is a CBOR map where integer labels carry meaning defined
          by the COSE registry. The most important labels are:
        </Prose>
        <DefinitionRows
          items={[
            ["1 (kty)", "Key type. 1 = OKP (EdDSA), 2 = EC2 (elliptic curve), 3 = RSA."],
            ["3 (alg)", "Algorithm. -7 = ES256 (EC2 + P-256 + SHA-256), -8 = EdDSA (OKP + Ed25519), -257 = RS256 (RSA + PKCS1v1.5 + SHA-256)."],
            ["-1 (crv / n)", "For EC2: curve ID. 1 = P-256, 2 = P-384, 3 = P-521. For OKP: 6 = Ed25519. For RSA: the modulus n."],
            ["-2 (x / e)", "For EC2 / OKP: the x-coordinate of the public key point. For RSA: the public exponent e."],
            ["-3 (y)", "For EC2 only: the y-coordinate (not present in OKP or RSA keys)."],
          ]}
        />
        <Prose>
          COSE's integer labels make serialized keys compact — roughly 30% smaller than an
          equivalent JWK — which matters inside the packed binary format of authenticatorData.
        </Prose>
      </Section>

      <Section id="client-data-json" title="What's Inside clientDataJSON">
        <Prose>
          <Code>clientDataJSON</Code> is not CBOR — it is UTF-8 JSON, base64url-encoded. The browser
          creates it and the authenticator signs it indirectly (as SHA-256(clientDataJSON)). Key fields:
        </Prose>
        <Bullets
          gap="space-y-1.5"
          items={[
            <><Strong>type</Strong> — either <Code>"webauthn.create"</Code> (registration) or <Code>"webauthn.get"</Code> (authentication). The server must verify this to prevent cross-ceremony replay attacks.</>,
            <><Strong>challenge</Strong> — the base64url-encoded random challenge issued by the server. Must be verified byte-for-byte.</>,
            <><Strong>origin</Strong> — the origin (scheme + host + port) of the page that invoked WebAuthn. The server must verify this matches its expected origin.</>,
            <><Strong>crossOrigin</Strong> — boolean, true when the WebAuthn call was made inside a cross-origin iframe. Relying parties that do not embed WebAuthn in iframes should reject true.</>,
            <><Strong>tokenBinding</Strong> — optional; relates to TLS token binding (rarely used in practice).</>,
          ]}
        />
      </Section>

      <Section id="debugging" title="Common Debugging Scenarios">
        <Prose>Use WebAuthn Decoder to diagnose these frequent integration problems:</Prose>
        <ul className="grid gap-3 sm:grid-cols-2">
          <ScenarioCard title="Origin mismatch">
            The <Code>origin</Code> in <Code>clientDataJSON</Code> does not match the server's expected
            origin. Common cause: testing on <Code>localhost</Code> but comparing against a production
            domain, or a missing port number.
          </ScenarioCard>
          <ScenarioCard title="RP ID hash mismatch">
            The first 32 bytes of <Code>authenticatorData</Code> do not match SHA-256(rpId). Often caused
            by a misconfigured <Code>rp.id</Code> in the credential options, or by comparing the wrong
            domain (e.g. including a subdomain that wasn't intended).
          </ScenarioCard>
          <ScenarioCard title="signCount regression">
            The signCount in the assertion is equal to or less than the value stored from a previous
            authentication. This is the authenticator's cloning-detection mechanism. Investigate
            whether multiple devices share a credential or whether the server's stored count is
            incorrect.
          </ScenarioCard>
          <ScenarioCard title="Unexpected AAGUID">
            The AAGUID in <Code>attestedCredentialData</Code> does not match the authenticator you
            expected. Check the FIDO Metadata Service (MDS) to see what device the AAGUID belongs to.
          </ScenarioCard>
          <ScenarioCard title="Unsupported attestation format">
            The server's attestation verification library does not support the <Code>fmt</Code> returned
            by the authenticator. Either widen the accepted formats or set{" "}
            <Code>attestation: "none"</Code> in <Code>PublicKeyCredentialCreationOptions</Code> if you do
            not need attestation verification.
          </ScenarioCard>
          <ScenarioCard title="UP or UV flag not set">
            The authenticator did not assert user presence (UP) or user verification (UV). Verify that
            the authenticator model supports the required user verification method and that{" "}
            <Code>userVerification</Code> is set to <Code>"required"</Code> when UV is mandatory for your
            threat model.
          </ScenarioCard>
        </ul>
      </Section>

      <Section id="privacy" title="Privacy & Security of This Tool">
        <div className="max-w-3xl rounded-xl border border-success/25 bg-success/5 p-5">
          <div className="flex items-start gap-3.5">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
              <ShieldCheck className="size-4.5" aria-hidden="true" />
            </span>
            <div className="space-y-3">
              <p className="text-pretty text-muted-foreground">
                WebAuthn payloads often contain real credential identifiers, user handles, and AAGUID
                values that can identify both the user and their authenticator. WebAuthn Decoder is
                designed so that none of this data ever leaves your browser:
              </p>
              <ul className="space-y-1.5 text-muted-foreground">
                {[
                  "All decoding (CBOR, base64url, hex, binary parsing) runs in JavaScript inside your browser tab.",
                  "No network requests are made with payload data — you can verify this with browser DevTools → Network.",
                  "No analytics, telemetry, or third-party SDKs receive your credential data.",
                  "There is no server-side component. The tool is a static single-page application.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-1 size-3.5 shrink-0 text-success" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-foreground/90">
                You can safely paste production credentials from your WebAuthn integration for
                debugging purposes.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="faq" title="Frequently Asked Questions">
        <Faq
          items={[
            [
              "Is base64url different from standard base64?",
              "Yes. Base64url uses - instead of + and _ instead of / in the alphabet, and omits = padding characters. WebAuthn uses base64url everywhere. Attempting to decode a WebAuthn payload with a standard base64 decoder often fails or produces garbage bytes — make sure to use a URL-safe decoder."
            ],
            [
              "What is an AAGUID?",
              "An Authenticator Attestation GUID (AAGUID) is a 16-byte identifier assigned by the authenticator manufacturer to a specific model. During registration it appears inside attestedCredentialData and lets the relying party look up the authenticator's metadata (manufacturer, supported algorithms, certifications) via the FIDO Metadata Service."
            ],
            [
              "Why is authenticatorData not plain CBOR?",
              "The WebAuthn specification chose a tightly packed binary layout for authenticatorData for performance reasons — the structure is signed directly by the authenticator and must be verifiable without a full CBOR parser on constrained hardware. The COSE key embedded inside it is CBOR, but the surrounding binary frame (rpIdHash, flags, signCount, credentialIdLength, credentialId) is manually packed."
            ],
            [
              "What does the backup eligibility (BE) flag mean?",
              "The BE (Backup Eligibility) flag, introduced with passkeys, indicates that the authenticator is capable of syncing the private key to a cloud account (e.g. iCloud Keychain or Google Password Manager). The companion BS (Backup State) flag indicates whether the key is currently synced. Relying parties can choose to reject credentials where BE is set if they require single-device binding."
            ],
            [
              "What formats can WebAuthn Decoder decode?",
              "WebAuthn Decoder accepts: a full PublicKeyCredential JSON object (paste the JSON directly), a base64url-encoded attestationObject or authenticatorData, a hex-encoded payload, or raw CBOR bytes pasted as base64url. The tool auto-detects the format and selects the right decoder."
            ],
            [
              "Can I use this tool offline?",
              "Yes. Once the page has loaded, all decoding works without an internet connection. You can save the page locally or self-host the static build output."
            ],
            [
              "What is the difference between attestation and assertion?",
              "Attestation is part of registration: the authenticator proves its identity and model to the server by signing with a manufacturer certificate chain. Assertion is part of authentication: the authenticator proves ownership of a previously registered private key by signing the challenge. Most deployments use attestation-none (skipping the proof-of-model step) because the full attestation verification infrastructure is complex."
            ],
          ]}
        />
      </Section>
    </article>
    </details>
  )
}
