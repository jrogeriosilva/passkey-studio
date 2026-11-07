import { CredentialDiagram, AttestationDiagram, ByteDiagram, LifecycleDiagram } from "./PayloadDiagrams"
import { appPath } from "../../../navigation"
import { type ReactNode } from "react"
import { ChevronDown } from "lucide-react"

/* ---------------------------------------------------------------------------
 * Small presentational helpers shared by every section below.
 * ------------------------------------------------------------------------- */

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-20 space-y-4">
      <h3 id={id} className="text-balance text-xl font-semibold tracking-tight">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Prose({ children }: { children: ReactNode }) {
  return <p className="payload-prose text-pretty text-muted-foreground">{children}</p>
}

function DefinitionRows({ items }: { items: [string, string][] }) {
  return (
    <dl className="payload-defs divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card/40">
      {items.map(([term, def]) => (
        <div key={term} className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-4">
          <dt className="font-mono text-xs font-medium text-tree-key">{term}</dt>
          <dd className="text-pretty text-muted-foreground">{def}</dd>
        </div>
      ))}
    </dl>
  )
}

function ScenarioCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="rounded-xl border border-border bg-card/40 p-4">
      <h4 className="text-balance font-medium text-foreground">{title}</h4>
      <p className="mt-1.5 text-pretty text-muted-foreground">{children}</p>
    </li>
  )
}

function Faq({ items }: { items: [string, string][] }) {
  return (
    <div className="payload-faq space-y-2">
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
          <p className="payload-prose px-4 pb-4 text-pretty text-muted-foreground">{a}</p>
        </details>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------- */

export function PayloadGuide() {
  return <section className="payload-guide mt-8 border-t border-border py-4" aria-labelledby="guide-heading">
    <article aria-labelledby="guide-heading" className="space-y-8 py-6 text-base leading-relaxed">
      <div className="space-y-3">
        <h2 id="guide-heading" className="text-2xl font-semibold">Understanding FIDO2 and WebAuthn Payloads</h2>
        <Prose>Explore the structures behind the ceremonies above. To decode and inspect a payload, open the <a className="text-primary underline" href={appPath('/webauthn-decoder/')}>Inspect</a> area of Passkey Studio.</Prose>
      </div>
      <Section id="what-is-fido2" title="FIDO2 and the credential lifecycle">
        <LifecycleDiagram />
        <Prose>WebAuthn defines the browser API and the data the server verifies. CTAP2 defines communication with authenticators. During registration, the authenticator creates a key pair. During authentication, it uses the private key to sign authenticatorData ‖ SHA-256(clientDataJSON).</Prose>
        <DefinitionRows items={[
          ['Registration', 'navigator.credentials.create() returns attestationObject and clientDataJSON. The server links the public key and identifier to the account.'],
          ['Authentication', 'navigator.credentials.get() returns authenticatorData, signature, clientDataJSON and, optionally, userHandle.'],
        ]} />
      </Section>
      <Section id="anatomy" title="PublicKeyCredential">
        <CredentialDiagram />
        <DefinitionRows items={[
          ['id / rawId', 'Credential identifier: id is base64url; rawId is binary in the API and base64url in the JSON representation.'],
          ['response.attestationObject', 'Registration CBOR map containing fmt, authData and attStmt.'],
          ['response.authenticatorData', 'Binary authentication structure. During registration, it is stored in authData inside attestationObject.'],
          ['response.clientDataJSON', 'UTF-8 JSON containing type, challenge and origin, encoded as base64url in the JSON representation.'],
          ['response.signature', 'Signature over authenticatorData ‖ SHA-256(clientDataJSON) during authentication.'],
          ['response.userHandle', 'Opaque user identifier defined during registration; may be null.'],
        ]} />
      </Section>
      <Section id="attestation-object" title="attestationObject and attestation formats">
        <AttestationDiagram />
        <DefinitionRows items={[
          ['none', 'No attestation statement. attStmt is an empty map.'],
          ['packed', 'Compact attestation format defined by WebAuthn.'],
          ['fido-u2f', 'Compatibility with FIDO U2F authenticators.'],
          ['tpm', 'Trusted Platform Module attestation.'],
          ['android-key', 'Android Keystore attestation.'],
          ['apple', 'Apple anonymous attestation format.'],
        ]} />
      </Section>
      <Section id="authenticator-data" title="authenticatorData: bytes and flags">
        <ByteDiagram />
        <DefinitionRows items={[
          ['rpIdHash · bytes 0–31', 'SHA-256 of the RP ID. Compare it with the hash of the domain expected by the server.'],
          ['flags · byte 32', 'UP (bit 0): user presence. UV (bit 2): user verification. BE (bit 3): backup eligibility. BS (bit 4): backup state. AT (bit 6): attested data. ED (bit 7): extensions.'],
          ['signCount · bytes 33–36', 'Unsigned 32-bit big-endian counter. A regression may indicate cloning, but some authenticators keep it at zero; the server must consider its policy and context.'],
          ['AT · bytes 37+', '16-byte AAGUID, credentialId length as 2 big-endian bytes, credentialId and COSE public key.'],
          ['ED · trailing bytes', 'CBOR extension map, present only when ED is set.'],
        ]} />
      </Section>
      <Section id="cose-keys" title="COSE labels">
        <DefinitionRows items={[
          ['1 (kty)', 'Type: 1 = OKP, 2 = EC2, 3 = RSA.'],
          ['3 (alg)', 'Algorithm: -7 = ES256, -8 = EdDSA, -257 = RS256.'],
          ['-1 (crv / n)', 'Curve for EC2/OKP: 1 = P-256, 2 = P-384, 3 = P-521, 6 = Ed25519. For RSA, this is the modulus n.'],
          ['-2 (x / e)', 'x coordinate for EC2/OKP; public exponent e for RSA.'],
          ['-3 (y)', 'EC2 y coordinate, absent in OKP and RSA.'],
        ]} />
      </Section>
      <Section id="client-data-json" title="clientDataJSON">
        <DefinitionRows items={[
          ['type', 'webauthn.create for registration; webauthn.get for authentication. Check the expected type to prevent reuse across ceremonies.'],
          ['challenge', 'Random challenge provided by the server, in base64url. Compare the bytes with the session challenge.'],
          ['origin', 'Scheme, domain and port of the page that called WebAuthn. Compare with the expected origin.'],
          ['crossOrigin', 'Indicates a call in a cross-origin context. Validate according to the RP policy.'],
          ['tokenBinding', 'Optional legacy field related to TLS Token Binding.'],
        ]} />
      </Section>
      <Section id="debugging" title="Common diagnostics">
        <ul className="payload-scenarios grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ScenarioCard title="Origin mismatch">Check the domain, scheme and port. localhost and production are different origins.</ScenarioCard>
          <ScenarioCard title="RP ID hash mismatch">Compare rpIdHash with SHA-256 of the configured RP ID, without a scheme or port.</ScenarioCard>
          <ScenarioCard title="Counter regression">Check the previous value, the server policy and whether the credential is shared across devices.</ScenarioCard>
          <ScenarioCard title="Unexpected AAGUID">Consult the local registry or FIDO metadata to identify the model. A synthetic sample does not prove device origin.</ScenarioCard>
          <ScenarioCard title="Unsupported format">Check fmt and the formats accepted by the server library. Use attestation: none when the policy does not require attestation.</ScenarioCard>
          <ScenarioCard title="Missing UP or UV">Check the authenticator capabilities and userVerification. Viewing fields does not validate the signature.</ScenarioCard>
        </ul>
      </Section>
      <Section id="privacy" title="Privacy and limitations">
        <Prose>JSON, CBOR, hex and base64url are processed in this browser. Payloads are not sent to a server, telemetry or external service, or persisted by the Inspector. Reloading discards the input. Internal navigation preserves work in memory. Samples are synthetic; the registry AAGUID only demonstrates identification.</Prose>
      </Section>
      <Section id="faq" title="Frequently asked questions">
        <Faq items={[
          ['Is Base64url different from Base64?', 'Yes. It uses - instead of + and _ instead of /, without = padding. The Inspector provides conversion guidance when it detects standard Base64.'],
          ['What is an AAGUID?', 'A 16-byte identifier for the authenticator model, assigned by the manufacturer and included in attested data.'],
          ['Why is authenticatorData not CBOR?', 'Its outer layout is binary with fields at fixed positions. Only the COSE key and extensions are CBOR.'],
          ['What do BE and BS mean?', 'BE indicates backup eligibility; BS indicates the current backup state. Interpret these flags according to the RP policy.'],
          ['Which formats are accepted?', 'Registration or authentication PublicKeyCredential JSON, clientDataJSON as JSON or base64url, attestationObject, binary authenticatorData and CBOR encoded as hex or base64url.'],
          ['Does it work offline?', 'Once the page and its resources have loaded, decoding works without a network connection. The static build can also be hosted locally.'],
          ['What is the difference between attestation and assertion?', 'Attestation belongs to registration and may demonstrate the authenticator origin. An assertion belongs to authentication and contains the signature made with the credential key.'],
        ]} />
      </Section>
    </article>
  </section>
}
