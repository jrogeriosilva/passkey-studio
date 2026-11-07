import { useState, type ReactNode } from 'react';

function Plate({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <figure className="payload-plate"><figcaption><h4>{title}</h4><p>{subtitle}</p></figcaption>{children}</figure>;
}

function Node({ title, children, tone = '' }: { title: string; children: ReactNode; tone?: string }) {
  return <div className={`payload-node ${tone}`}><strong>{title}</strong><div>{children}</div></div>;
}

export function CredentialDiagram() {
  return <Plate title="Anatomy of a PublicKeyCredential" subtitle="One envelope. Two ceremonies. Different response fields.">
    <div className="payload-root"><Node title="PublicKeyCredential">Returned by create() / get()</Node></div>
    <div className="payload-branches metadata">
      <Node title="id / rawId">Credential identifier<small>base64url / ArrayBuffer</small></Node>
      <Node title="type"><code>"public-key"</code></Node>
      <Node title="response">Ceremony payload</Node>
    </div>
    <div className="payload-response-label">response fields</div>
    <div className="payload-branches response-fields">
      <Node title="attestationObject" tone="blue">CBOR map<small>fmt · authData · attStmt</small><em>Registration</em></Node>
      <Node title="authenticatorData" tone="green">Binary frame<small>rpIdHash · flags · signCount</small><em>Authentication</em></Node>
      <Node title="clientDataJSON">UTF-8 JSON<small>type · challenge · origin</small><em>Both ceremonies</em></Node>
      <Node title="signature" tone="green">Cryptographic signature<small>authenticatorData ‖ clientDataHash</small><em>Authentication</em></Node>
      <Node title="userHandle" tone="green">User identifier<small>May be null</small><em>Authentication</em></Node>
    </div>
    <p className="payload-note">During registration, authenticator data is embedded in attestationObject as authData. The browser creates clientDataJSON and sends only its SHA-256 hash to a CTAP2 authenticator.</p>
  </Plate>;
}

const formats = [
  ['none', 'No attestation statement', '{}'],
  ['packed', 'Compact attestation', '{ alg, sig, x5c? }'],
  ['fido-u2f', 'Legacy U2F compatibility', '{ sig, x5c }'],
  ['tpm', 'Trusted Platform Module', '{ ver, alg, sig, certInfo, pubArea, … }'],
  ['android-key', 'Android Keystore', '{ alg, sig, x5c }'],
  ['apple', 'Apple anonymous attestation', '{ x5c }'],
];

export function AttestationDiagram() {
  const [selected, setSelected] = useState(0);
  return <Plate title="Inside the attestationObject" subtitle="Registration response · a CBOR map with three top-level keys">
    <div className="payload-root"><Node title="attestationObject" tone="blue">CBOR map · 3 keys</Node></div>
    <div className="payload-branches metadata">
      <Node title="fmt" tone="purple">Format identifier<small>Defines how to interpret attStmt</small></Node>
      <Node title="authData" tone="blue">Authenticator data bytes<small>Binary frame + credential public key</small></Node>
      <Node title="attStmt" tone="amber">Attestation statement<small>Structure depends on fmt</small></Node>
    </div>
    <h5 className="payload-subheading">Explore an attestation format</h5>
    <div className="payload-format-tabs" role="group" aria-label="Attestation format">{formats.map(([name], i) => <button key={name} type="button" aria-pressed={i === selected} onClick={() => setSelected(i)}>{name}</button>)}</div>
    <div className="payload-format-detail" aria-live="polite"><div><strong>{formats[selected][0]}</strong><p>{formats[selected][1]}</p></div><code>{formats[selected][2]}</code></div>
    <p className="payload-note">Illustrative field names. The attestation preference defaults to none; direct is a request, not a guarantee. Verify the returned format under relying party policy. fmt: none has an empty attStmt and no attestation signature.</p>
  </Plate>;
}

export function ByteDiagram() {
  const flags = [['7', 'ED', 'Extensions'], ['6', 'AT', 'Attested data'], ['5', '—', 'Reserved'], ['4', 'BS', 'Backup state'], ['3', 'BE', 'Backup eligible'], ['2', 'UV', 'User verified'], ['1', '—', 'Reserved'], ['0', 'UP', 'User present']];
  return <Plate title="authenticatorData, byte by byte" subtitle="A binary frame with a 37-byte fixed header and optional trailing data">
    <div className="payload-bytes">
      <Node title="rpIdHash" tone="blue"><b>0–31</b><small>32 bytes · SHA-256(rpId)</small></Node>
      <Node title="flags" tone="purple"><b>32</b><small>1 byte · bitmask</small></Node>
      <Node title="signCount" tone="green"><b>33–36</b><small>4 bytes · uint32 BE</small></Node>
      <Node title="attestedCredentialData" tone="amber"><b>37+</b><small>Variable · only when AT = 1</small></Node>
      <Node title="extensions"><b>Trailing</b><small>CBOR · only when ED = 1</small></Node>
    </div>
    <h5 className="payload-subheading">Flags byte <span>Most significant bit → least significant bit</span></h5>
    <div className="payload-flags">{flags.map(([bit, flag, label]) => <div key={bit} className={flag === '—' ? 'reserved' : ''}><small>bit {bit}</small><strong>{flag}</strong><span>{label}</span></div>)}</div>
    <h5 className="payload-subheading">Attested credential data <span>Present only when AT = 1</span></h5>
    <div className="payload-attested">
      <Node title="AAGUID">16 bytes<small>Model identifier; may be all zeros</small></Node>
      <Node title="credentialIdLength">2 bytes · uint16 BE<small>Length of the following ID</small></Node>
      <Node title="credentialId">Variable length<small>Credential identifier</small></Node>
      <Node title="credentialPublicKey" tone="blue">CBOR COSE_Key<small>Public key for verification</small></Node>
    </div>
    <p className="payload-note">Read the outer frame byte by byte. Only the embedded COSE key and extensions are CBOR; the entire structure is not a CBOR object. Layout is schematic, not to scale.</p>
  </Plate>;
}

export function LifecycleDiagram() {
  return <Plate title="The credential lifecycle" subtitle="Registration creates a credential. Authentication proves possession.">
    <div className="payload-lifecycle">{[
      { title: 'Registration', api: 'navigator.credentials.create()', tone: 'blue', steps: ['Server issues challenge + RP + user', 'Browser requests credential creation', 'Authenticator creates a key pair', 'Server verifies response and stores public key'], result: 'attestationObject + clientDataJSON' },
      { title: 'Authentication', api: 'navigator.credentials.get()', tone: 'green', steps: ['Server issues a fresh challenge', 'Browser requests an assertion', 'Authenticator signs using the private key', 'Server verifies the assertion signature'], result: 'authenticatorData + signature + clientDataJSON' },
    ].map(flow => <div className={`payload-flow ${flow.tone}`} key={flow.title}><h5>{flow.title}</h5><code>{flow.api}</code><ol>{flow.steps.map(step => <li key={step}>{step}</li>)}</ol><div className="payload-flow-result"><small>Response fields</small><code>{flow.result}</code></div></div>)}</div>
    <p className="payload-note">The private key is not sent to the relying party. Explore each exchange in the Sequence view above.</p>
  </Plate>;
}
