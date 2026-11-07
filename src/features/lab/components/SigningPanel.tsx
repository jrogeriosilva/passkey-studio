import { labError } from '../utils/errors'
import { base64url } from '../utils/crypto'
import { useState, useEffect } from 'react'
import { LoaderCircle, Signature } from 'lucide-react'
import { getAssertion } from '../utils/fido2Hardware'
import { createSimulatedAssertion } from '../utils/fido2Simulator'
import { getCredentialById, updateSignCount, getCredentials, type StoredCredential } from '../utils/localStorage'
import { Button } from './ui/button'
import { Alert } from './ui/alert'
import { Field } from './ui/field'
import { Select } from './ui/select'
import { InlineCode } from './ui/inline-code'
import { CodeEditor } from './ui/code-editor'
import type { AssertionData } from './AssertionDisplay'

const DEFAULT_JSON = {
  challenge: 'VN00RzBXws786lXX2NrBhxpV3002sfeLhvSHyY_m4RBp7yhX34hPHnCVy_55saIxkqGRlJGvpCNChduIrZSn7DiSnqq___E4EuJvw3QUFC9SrGKgvSVsQ6CptqTddl8jfQCBJoYRftQibRcBNWfDmQswtKb3Ee6y_fprIyD02nw',
  userVerification: 'preferred',
  timeout: 60000,
}

interface Props {
  mode: string
  refreshKey: number
  onAssertionGenerated?: (a: AssertionData) => void
}

export default function SigningPanel({ mode, refreshKey, onAssertionGenerated }: Props) {
  const [credentials, setCredentials] = useState<StoredCredential[]>([])
  const [selectedCredentialId, setSelectedCredentialId] = useState('')
  const [jsonInput, setJsonInput] = useState(JSON.stringify(DEFAULT_JSON, null, 2))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const allCredentials = getCredentials()
    const filtered = mode === 'hardware'
      ? allCredentials.filter(c => c.type === 'hardware')
      : allCredentials.filter(c => c.type === 'simulated')
    setCredentials(filtered)
    setSelectedCredentialId(current => filtered.some(c => c.id === current) ? current : '')
  }, [refreshKey, mode])

  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonInput)
      const allowedId = (parsed.allowCredentials as Array<{ id: string }> | undefined)?.[0]?.id
      if (allowedId) {
        const match = credentials.find(c => c.id === allowedId)
        if (match) {
          setSelectedCredentialId(match.id)
          return
        }
      }
    } catch { /* ignore */ }
  }, [jsonInput, credentials])

  useEffect(() => {
    const select = (event: Event) => {
      const id = (event as CustomEvent<string>).detail
      setSelectedCredentialId(id)
      setJsonInput(JSON.stringify({ ...DEFAULT_JSON, allowCredentials: [{ id, type: 'public-key' }] }, null, 2))
    }
    window.addEventListener('studio:sign', select)
    return () => window.removeEventListener('studio:sign', select)
  }, [])

  const handleSign = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let config: Record<string, unknown>
      try {
        config = JSON.parse(jsonInput)
      } catch { throw new Error('Invalid JSON. Check quotes and commas, or restore the sample.') }
      if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Options must be a JSON object.')

      const challenge = config.challenge as string
      if (!challenge) throw new Error('Enter a challenge.')
      if (mode === 'simulated' && !selectedCredentialId) throw new Error('Select a simulated credential.')

      const credential = credentials.find(c => c.id === selectedCredentialId)
      if (mode === 'simulated' && !credential) throw new Error('Credential not found.')

      let assertion: AssertionData

      if (mode === 'hardware') {
        assertion = await getAssertion(config) as AssertionData
      } else {
        const current = getCredentialById(credential!.id)
        if (!current) throw new Error('The credential was deleted. Choose another.')
        const count = (current.signCount ?? 0) + 1
        if (count > 0xffffffff) throw new Error('Counter exhausted. Create another test credential.')
        assertion = await createSimulatedAssertion({ challenge, credential: current, rpId: config.rpId as string | undefined, signCount: count, allowCredentials: config.allowCredentials as PublicKeyCredentialDescriptorJSON[] | undefined }) as AssertionData
        if (!updateSignCount(current.id, count)) throw new Error('Could not save the counter. No response was published.')
      }

      setSuccess('Assertion generated.')
      onAssertionGenerated?.(assertion)
    } catch (err) {
      setError(labError(err))
    } finally {
      setLoading(false)
    }
  }

  const noCredentials = credentials.length === 0

  return (
    <div className="flex flex-col gap-5" onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); if (!loading) void handleSign() } }}>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => setJsonInput(JSON.stringify(DEFAULT_JSON, null, 2))}>Restore sample</Button>
        <Button variant="ghost" onClick={() => { try { const value = JSON.parse(jsonInput); value.challenge = base64url.encode(crypto.getRandomValues(new Uint8Array(32))); setJsonInput(JSON.stringify(value, null, 2)) } catch { setError('Fix the JSON before generating a challenge.') } }}>New challenge</Button>
      </div>
      <Field
        label="Authentication options (JSON)"
        hint={
          <>
            JSON representation of <InlineCode>PublicKeyCredentialRequestOptions</InlineCode>.
            Encode the required <InlineCode>challenge</InlineCode> and credential IDs as base64url without padding. When{' '}
            <InlineCode>allowCredentials</InlineCode> matches a stored credential, it is selected automatically. You can change the selection.
            {mode === 'simulated' && ' Simulation enforces rpId and allowCredentials, with synthetic UP/UV flags. User verification policy and extensions are not simulated.'}
          </>
        }
      >
        <CodeEditor label="Authentication options (JSON)"
          language="json"
          value={jsonInput}
          onChange={e => setJsonInput(e.target.value)}
          placeholder="Paste PublicKeyCredentialRequestOptions as JSON…"
          minHeight={180}
          maxHeight={400}
        />
      </Field>

      <Field
        label="Credential"
        htmlFor="signing-credential"
        required={mode === 'simulated'}
        hint={
          mode === 'hardware'
            ? 'Optional local shortcut. The browser can use discoverable credentials even when no local record exists.'
            : noCredentials ? 'No simulated credentials. Create one in the Create credential tab.' : undefined
        }
      >
          <Select id="signing-credential"
            value={selectedCredentialId}
            onChange={e => {
              setSelectedCredentialId(e.target.value)
              try { const config = JSON.parse(jsonInput); config.allowCredentials = e.target.value ? [{ type: 'public-key', id: e.target.value }] : []; setJsonInput(JSON.stringify(config, null, 2)) } catch { /* Preserve edits until valid. */ }
            }}
            className="font-mono"
            disabled={noCredentials}
          >
            <option value="">
              {mode === 'hardware' ? 'Let the browser choose a credential' : noCredentials ? 'No simulated credentials' : 'Select a credential…'}
            </option>
            {credentials.map(c => (
              <option key={c.id} value={c.id}>
                {c.userName || c.userId} · {c.algorithm} · {c.id.substring(0, 16)}…
              </option>
            ))}
          </Select>
      </Field>

      {error && <Alert variant="destructive">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleSign}
          disabled={loading || (mode === 'simulated' && !selectedCredentialId)}
        >
          {loading ? <LoaderCircle size={15} className="animate-spin" /> : <Signature size={15} />}
          {loading ? 'Generating…' : 'Generate assertion'}
        </Button>
        {mode === 'hardware' && (
          <span className="text-xs text-[var(--muted-foreground)]">
            The browser will prompt for the authenticator.
          </span>
        )}
      </div>
    </div>
  )
}
