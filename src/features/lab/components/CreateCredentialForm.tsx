import { labError } from '../utils/errors'
import { base64url } from '../utils/crypto'
import { useState } from 'react'
import { CircleCheck, KeyRound, LoaderCircle } from 'lucide-react'
import { createCredential, parseAlgorithm } from '../utils/fido2Hardware'
import { createSimulatedCredential } from '../utils/fido2Simulator'
import { saveCredential, getGeneratedKeys, markKeyAsUsed } from '../utils/localStorage'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Alert } from './ui/alert'
import { Field } from './ui/field'
import { Select } from './ui/select'
import { InlineCode } from './ui/inline-code'
import { CopyButton } from './ui/copy-button'
import { CodeEditor } from './ui/code-editor'
import KeyGeneratorButton from './KeyGeneratorButton'
import { DecoderActions } from './DecoderActions'
import JsonDisplay from './JsonDisplay'

const DEFAULT_JSON = {
  rp: { name: 'Passkey Studio', id: window.location.hostname },
  user: { id: 'dGVzdC11c2Vy', name: 'test@example.com', displayName: 'Test user' },
  challenge: 'elDBLGCwRwGCOMRCQkloMmn9PdbaF8YlLzZpEFX9AAUa4uVyDVraNAeL3gkio1IIpfg4HsCjTZI65cm__1BTynLoa4I6oes4avuz5SVHOsZ8leYwbjuHaTdztrlzafnmkKyYlqsor1i4YNlpXlaicavlnQXl-Pkhjeptqu-pQwM',
  pubKeyCredParams: [
    { type: 'public-key', alg: -7 },
    { type: 'public-key', alg: -257 },
  ],
  timeout: 60000,
  attestation: 'direct',
  authenticatorSelection: {
    authenticatorAttachment: 'cross-platform',
    residentKey: 'required',
    requireResidentKey: true,
    userVerification: 'required',
  },
}

interface Props {
  mode: string
  onCredentialCreated?: () => void
}

export default function CreateCredentialForm({ mode, onCredentialCreated }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [jsonInput, setJsonInput] = useState(JSON.stringify(DEFAULT_JSON, null, 2))
  const [selectedKeyId, setSelectedKeyId] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  const generatedKeys = getGeneratedKeys().filter(k => !k.used)

  const handleCreate = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setResult(null)

    try {
      let config: Record<string, unknown>
      try {
        config = JSON.parse(jsonInput)
      } catch {
        throw new Error('Invalid JSON. Check quotes, commas and braces, or restore the sample.')
      }
      if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Options must be a JSON object.')

      const rpId = (config.rp as Record<string, string>)?.id || window.location.hostname
      const rpName = (config.rp as Record<string, string>)?.name || 'Passkey Studio'
      const user = config.user as Record<string, string> | undefined
      const userId = user?.id ?? 'dGVzdC11c2Vy'
      const userName = user?.name || 'testuser@example.com'
      const userDisplayName = user?.displayName || 'Test user'
      const challengeToUse = config.challenge as string

      if (!challengeToUse) throw new Error('Enter a challenge in the JSON options.')

      let algorithm = 'ES256'
      const params = config.pubKeyCredParams as Array<{ alg: number }> | undefined
      if (params && params.length > 0) {
        const supported = params.find(item => item.alg === -7 || item.alg === -257)
        if (mode === 'simulated' && !supported) throw new Error('Simulation supports only ES256 and RS256. Use WebAuthn mode with a compatible authenticator for other algorithms.')
        algorithm = supported?.alg === -257 ? 'RS256' : 'ES256'
      }

      if (mode === 'hardware') {
        const hwCredential = await createCredential(config)
        const credential = {
          id: hwCredential.id,
          type: 'hardware' as const,
          algorithm: hwCredential.response.publicKeyAlgorithm !== undefined ? parseAlgorithm(hwCredential.response.publicKeyAlgorithm) : 'Unknown',
          credentialId: hwCredential.rawId,
          response: { ...hwCredential.response },
          rpId,
          rpName,
          userId,
          userName,
          userDisplayName,
          createdAt: new Date().toISOString(),
        }
        if (!saveCredential(credential)) throw new Error('Could not save. Check browser storage.')
        setResult({ ...hwCredential })
        setSuccess('WebAuthn credential created. Send the response to the RP server for verification.')
      } else {
        const key = generatedKeys.find(k => k.id === selectedKeyId)
        if (selectedKeyId && !key) throw new Error('The selected key is no longer available. Choose another.')
        if (key) algorithm = key.algorithm
        if (params?.length && !params.some(item => item.alg === (algorithm === 'RS256' ? -257 : -7))) throw new Error('The key algorithm is not in pubKeyCredParams. Choose another key or adjust the options.')

        const simCredential = await createSimulatedCredential({
          challenge: challengeToUse,
          algorithm,
          rpId,
          rpName,
          userId,
          userName,
          userDisplayName,
          existingKeyPair: key ? { publicKey: key.publicKey, privateKey: key.privateKey } : null,
          excludeCredentials: config.excludeCredentials as PublicKeyCredentialDescriptorJSON[] | undefined,
        })
        const credential = {
          id: simCredential.id,
          type: 'simulated' as const,
          algorithm: simCredential.algorithm,
          credentialId: simCredential.rawId,
          publicKeyJWK: simCredential.publicKeyJWK,
          privateKeyJWK: simCredential.privateKeyJWK,
          response: simCredential.response,
          rpId: simCredential.rpId,
          rpName: simCredential.rpName,
          userId: simCredential.userId,
          userName: simCredential.userName,
          userDisplayName: simCredential.userDisplayName,
          createdAt: simCredential.createdAt,
        }
        if (!saveCredential(credential)) throw new Error('Could not save. Check browser storage.')
        if (key && !markKeyAsUsed(key.id)) throw new Error('Credential saved, but the key could not be marked as used.')
        setResult({
          type: 'public-key',
          id: simCredential.id,
          rawId: simCredential.rawId,
          clientExtensionResults: simCredential.clientExtensionResults,
          response: {
            attestationObject: simCredential.response.attestationObject,
            clientDataJSON: simCredential.response.clientDataJSON,
          },
        })
        setSuccess(`Simulated credential created (${algorithm}).`)
      }

      setSelectedKeyId('')
      onCredentialCreated?.()
    } catch (err) {
      setError(labError(err))
    } finally {
      setLoading(false)
    }
  }

  const noKeys = generatedKeys.length === 0

  return (
    <div className="flex flex-col gap-5" onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); if (!loading) void handleCreate() } }}>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? <LoaderCircle size={15} className="animate-spin" /> : <KeyRound size={15} />}
          {loading ? 'Creating…' : `Create ${mode === 'hardware' ? 'WebAuthn' : 'simulated'} credential`}
        </Button>
        {mode === 'hardware' && (
          <span className="text-xs text-[var(--muted-foreground)]">
            The browser will prompt for an authenticator.
          </span>
        )}
      </div>

      {mode === 'simulated' && (
        <details><summary className="cursor-pointer min-h-11 py-3 text-sm">Use a pre-generated key (optional)</summary>
        <p className="mb-3 text-sm text-[var(--muted-foreground)]">Test fixture only. In WebAuthn registration, the authenticator generates a new credential key pair; the website does not supply the private key.</p>
        <Field
          label="Pre-generated key (optional)"
          htmlFor="creation-key"
          hint={
            noKeys
              ? 'A unique key will be generated automatically. Selecting one in advance is optional.'
              : 'The selected pair will be linked to the credential and marked as used. Without a selection, a new pair will be generated.'
          }
        >
          <Select
            id="creation-key"
            value={selectedKeyId}
            onChange={e => setSelectedKeyId(e.target.value)}
            className="font-mono"
          >
            <option value="">
              Generate a unique key automatically
            </option>
            {generatedKeys.map(k => (
              <option key={k.id} value={k.id}>
                {k.algorithm} · {k.id} · {new Date(k.createdAt).toLocaleString('en-US')}
              </option>
            ))}
          </Select>
        </Field></details>
      )}
      {mode === 'simulated' && <details>
        <summary className="cursor-pointer py-3 text-sm">Generate a test key</summary>
        <KeyGeneratorButton refreshKey={generatedKeys.length} onKeyGenerated={key => { if (key) setSelectedKeyId(key.id); onCredentialCreated?.() }} />
      </details>}

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => setJsonInput(JSON.stringify(DEFAULT_JSON, null, 2))}>Restore sample</Button>
        <Button variant="ghost" onClick={() => { try { const value = JSON.parse(jsonInput); value.challenge = base64url.encode(crypto.getRandomValues(new Uint8Array(32))); setJsonInput(JSON.stringify(value, null, 2)) } catch { setError('Fix the JSON before generating a challenge.') } }}>New challenge</Button>
      </div>
      <Field
        label="Creation options (JSON)"
        hint={
          <>
            JSON representation of <InlineCode>PublicKeyCredentialCreationOptions</InlineCode>.
            Encode <InlineCode>challenge</InlineCode>, <InlineCode>user.id</InlineCode> (1–64 bytes) and credential IDs as base64url without padding.
            {mode === 'simulated' && ' Simulation returns none attestation with synthetic UP/UV flags. Authenticator selection and extensions are not simulated.'}
          </>
        }
      >
        <CodeEditor label="Credential creation options (JSON)"
          language="json"
          value={jsonInput}
          onChange={e => setJsonInput(e.target.value)}
          placeholder="Paste PublicKeyCredentialCreationOptions as JSON…"
          minHeight={180}
          maxHeight={260}
        />
      </Field>

      {error && <Alert variant="destructive">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}


      {result && (
        <section className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--success)]/12 text-[var(--success)]">
                <CircleCheck size={14} />
              </span>
              <h3 className="text-sm font-semibold">Credential created</h3>
              <Badge variant="success">registration response</Badge>
            </div>
            <CopyButton value={JSON.stringify(result, null, 2)} label="Copy all" />
          </div>
          <div className="flex flex-wrap gap-2"><DecoderActions data={result} /><Button variant="secondary" onClick={() => window.dispatchEvent(new CustomEvent('studio:sign', { detail: result.id }))}>Sign with this credential</Button></div>
          <JsonDisplay data={result} maxHeight={600} copyable={false} />
        </section>
      )}
    </div>
  )
}
