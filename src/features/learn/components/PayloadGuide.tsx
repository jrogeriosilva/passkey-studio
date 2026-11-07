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
        <Prose>FIDO2 combines WebAuthn, which defines the web API and relying-party verification, with CTAP2, which defines communication between a client platform and a roaming authenticator. Platform authenticators can use operating-system APIs. Registration creates a credential key pair; authentication signs authenticatorData ‖ SHA-256(clientDataJSON).</Prose>
        <DefinitionRows items={[
          ['Registration', 'navigator.credentials.create() returns attestationObject and clientDataJSON. The server links the public key and identifier to the account.'],
          ['Authentication', 'navigator.credentials.get() returns authenticatorData, signature, clientDataJSON and, optionally, userHandle.'],
          ['Passkey', 'A discoverable FIDO credential. Request residentKey: "required" to require discoverability. The Hello and phone examples do this; the presence-only USB example is a non-discoverable FIDO2 credential. Security keys can also store passkeys.'],
          ['Discoverable sign-in', 'The authenticator can select an account without an allowCredentials list. With an empty or omitted list, the response must include userHandle so the server can identify the account. These examples use a known username and an explicit list.'],
          ['UP / UV', 'A touch can prove user presence (UP) without verifying identity (UV). A supported PIN or biometric can provide UV. userVerification: "required" demands UV; "preferred" permits a result without UV.'],
          ['Device-bound / synced', 'Device-bound credentials stay with their authenticator. A passkey provider can synchronize encrypted credential material across devices. Neither flow sends the private key to the relying party; secure-element storage is implementation-dependent.'],
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
        <Prose>The attestation preference defaults to "none". Requesting "direct" expresses a preference, not a guarantee of manufacturer attestation. In these illustrative scenarios, the USB key returns packed, TPM-backed Hello returns tpm and the phone returns none. The server processes the format actually received under its policy.</Prose>
        <DefinitionRows items={[
          ['none', 'No attestation statement. attStmt is an empty map.'],
          ['packed', 'Compact attestation format defined by WebAuthn.'],
          ['fido-u2f', 'Compatibility with FIDO U2F authenticators.'],
          ['tpm', 'Trusted Platform Module attestation.'],
          ['android-key', 'Android Keystore attestation.'],
          ['apple', 'Apple anonymous attestation format.'],
        ]} />
      </Section>
      <Section id="server-verification" title="What the server must verify">
        <Prose>The animation shows selected checks, not a complete verifier. Use the full WebAuthn relying-party algorithms or a maintained implementation; decoding a field does not establish that it is trustworthy.</Prose>
        <DefinitionRows items={[
          ['Both ceremonies', 'Validate the response type, expected clientDataJSON.type, challenge, allowed origin, RP ID hash, UP and required UV. Enforce cross-origin and extension policy. Check challenge expiry and single use; consume it on success.'],
          ['Registration', 'Validate credential structure and the offered public-key algorithm, reject an already registered credential ID, and verify attestation and its trust path when required by policy. fmt: none supplies no attestation statement or manufacturer proof.'],
          ['Credential record', 'Store the account association, credential ID, public key, returned signCount, backup eligibility and backup state. Do not assume every authenticator starts its counter at zero.'],
          ['Authentication', 'Check credential ownership and allowCredentials membership when supplied, and validate userHandle when present or required. Verify the signature over the exact authenticatorData bytes followed by SHA-256 of the original clientDataJSON bytes. Do not reserialize that JSON before hashing.'],
          ['Signature counter', 'When either the stored or returned counter is nonzero, compare them. A non-increasing value is a risk signal, not proof of cloning; use RP policy. If both are zero, no increase is required. Persist the accepted counter and backup state.'],
        ]} />
      </Section>
      <Section id="authenticator-data" title="authenticatorData: bytes and flags">
        <ByteDiagram />
        <DefinitionRows items={[
          ['rpIdHash · bytes 0–31', 'SHA-256 of the configured RP ID, without scheme or port. The RP ID can be an allowed parent domain of the origin; it is not the full origin.'],
          ['flags · byte 32', 'UP (bit 0): user presence. UV (bit 2): user verification. BE (bit 3): backup eligibility. BS (bit 4): backup state. AT (bit 6): attested data. ED (bit 7): extensions.'],
          ['signCount · bytes 33–36', 'Unsigned 32-bit big-endian counter. A non-increasing nonzero comparison may indicate cloning, malfunction or out-of-order responses. Some authenticators keep it at zero; apply the server risk policy.'],
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
          ['challenge', 'Server-provided challenge in unpadded base64url. Compare the decoded bytes with the challenge for this attempt. WebAuthn recommends at least 16 bytes with sufficient entropy; these examples use 32. Enforce expiry and single use.'],
          ['origin', 'Scheme, domain and port of the page that called WebAuthn. Compare with the expected origin.'],
          ['crossOrigin', 'Indicates a call in a cross-origin context. Validate according to the RP policy.'],
          ['topOrigin', 'Present for cross-origin requests in current WebAuthn. Check the top-level origin against the RP policy when crossOrigin is true.'],
          ['tokenBinding', 'Optional legacy field related to TLS Token Binding.'],
        ]} />
      </Section>
      <Section id="debugging" title="Common diagnostics">
        <ul className="payload-scenarios grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ScenarioCard title="Origin mismatch">Check the domain, scheme and port. localhost and production are different origins.</ScenarioCard>
          <ScenarioCard title="RP ID hash mismatch">Compare rpIdHash with SHA-256 of the configured RP ID, without a scheme or port.</ScenarioCard>
          <ScenarioCard title="Counter regression">Check the previous value, the server policy and whether the credential is shared across devices.</ScenarioCard>
          <ScenarioCard title="Unexpected AAGUID">An AAGUID may identify an authenticator model or be all zeros. A registry lookup alone does not prove device origin; attestation must be verified when that assurance is required.</ScenarioCard>
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
          ['What is an AAGUID?', 'A 16-byte value in attested credential data that can identify an authenticator model. It may be all zeros, and a model lookup without trusted attestation is not proof of device origin.'],
          ['Why is authenticatorData not CBOR?', 'Its outer layout is binary with fields at fixed positions. Only the COSE key and extensions are CBOR.'],
          ['What do BE and BS mean?', 'BE indicates backup eligibility and must remain stable for a credential. BS indicates whether it is currently backed up and may change. BE=0 with BS=1 is invalid. BE=1, BS=1 means eligible and backed up, not merely syncable.'],
          ['Which formats are accepted?', 'Registration or authentication PublicKeyCredential JSON, clientDataJSON as JSON or base64url, attestationObject, binary authenticatorData and CBOR encoded as hex or base64url.'],
          ['Does it work offline?', 'Once the page and its resources have loaded, decoding works without a network connection. The static build can also be hosted locally.'],
          ['What is the difference between attestation and assertion?', 'Attestation belongs to registration and may demonstrate the authenticator origin. An assertion belongs to authentication and contains the signature made with the credential key.'],
        ]} />
      </Section>
      <Section id="technical-references" title="Technical references">
        <Prose>Check the normative details in <a className="text-primary underline" href="https://www.w3.org/TR/webauthn-3/">W3C WebAuthn</a>, <a className="text-primary underline" href="https://fidoalliance.org/specs/fido-v2.3-ps-20260226/fido-client-to-authenticator-protocol-v2.3-ps-20260226.html">FIDO CTAP 2.3</a> and <a className="text-primary underline" href="https://www.rfc-editor.org/rfc/rfc9053.html#section-7.1">COSE key parameters</a>. For implementation context, see <a className="text-primary underline" href="https://www.passkeycentral.org/introduction-to-passkeys/how-passkeys-work">FIDO’s passkey overview</a> and Microsoft’s <a className="text-primary underline" href="https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/how-it-works">Windows Hello key protection</a> and <a className="text-primary underline" href="https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/windows-hello-face-authentication">face authentication</a> documentation.</Prose>
      </Section>
    </article>
  </section>
}
