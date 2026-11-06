import { labError } from '../utils/errors'
import { base64url } from '../utils/crypto'
import { useState, useEffect } from 'react'
import { LoaderCircle, Signature } from 'lucide-react'
import { getAssertion } from '../utils/fido2Hardware'
import { createSimulatedAssertion } from '../utils/fido2Simulator'
import { getCredentialById, updateSignCount, getCredentials, type StoredCredential } from '../utils/localStorage'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Alert } from './ui/alert'
import { Field } from './ui/field'
import { Select } from './ui/select'
import { InlineCode } from './ui/inline-code'
import { CodeEditor } from './ui/code-editor'

const DEFAULT_JSON = {
  challenge: 'VN00RzBXws786lXX2NrBhxpV3002sfeLhvSHyY_m4RBp7yhX34hPHnCVy_55saIxkqGRlJGvpCNChduIrZSn7DiSnqq___E4EuJvw3QUFC9SrGKgvSVsQ6CptqTddl8jfQCBJoYRftQibRcBNWfDmQswtKb3Ee6y_fprIyD02nw',
  userVerification: 'preferred',
  timeout: 60000,
}

interface AssertionData {
  id: string
  rawId: string
  response: Record<string, string | null>
  algorithm?: string
  credentialId?: string
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
      } catch { throw new Error('JSON inválido. Confira aspas e vírgulas ou restaure o exemplo.') }
      if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('As opções devem ser um objeto JSON.')

      const challenge = config.challenge as string
      if (!challenge) throw new Error('Informe o challenge.')
      if (mode === 'simulated' && !selectedCredentialId) throw new Error('Selecione uma credencial simulada.')

      const credential = credentials.find(c => c.id === selectedCredentialId)
      if (mode === 'simulated' && !credential) throw new Error('Credencial não encontrada.')

      let assertion: AssertionData

      if (mode === 'hardware') {
        assertion = await getAssertion(config) as AssertionData
      } else {
        const current = getCredentialById(credential!.id)
        if (!current) throw new Error('A credencial foi excluída. Escolha outra.')
        const count = (current.signCount ?? 0) + 1
        if (count > 0xffffffff) throw new Error('Contador esgotado. Crie outra credencial de teste.')
        assertion = await createSimulatedAssertion({ challenge, credential: current, rpId: current.rpId, signCount: count }) as AssertionData
        if (!updateSignCount(current.id, count)) throw new Error('Não foi possível salvar o contador. Nenhuma resposta foi publicada.')
      }

      setSuccess('Assertion gerada.')
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
        <Button variant="ghost" onClick={() => setJsonInput(JSON.stringify(DEFAULT_JSON, null, 2))}>Restaurar exemplo</Button>
        <Button variant="ghost" onClick={() => { try { const value = JSON.parse(jsonInput); value.challenge = base64url.encode(crypto.getRandomValues(new Uint8Array(32))); setJsonInput(JSON.stringify(value, null, 2)) } catch { setError('Corrija o JSON antes de gerar um challenge.') } }}>Novo challenge</Button>
      </div>
      <Field
        label="Opções de autenticação (JSON)"
        hint={
          <>
            Objeto <InlineCode>PublicKeyCredentialRequestOptions</InlineCode>.
            O campo <InlineCode>challenge</InlineCode> é obrigatório. Quando{' '}
            <InlineCode>allowCredentials</InlineCode> coincide com uma credencial armazenada, ela é selecionada automaticamente. Você pode alterar a seleção.
          </>
        }
      >
        <CodeEditor label="Opções de autenticação (JSON)"
          language="json"
          value={jsonInput}
          onChange={e => setJsonInput(e.target.value)}
          placeholder="Cole as opções PublicKeyCredentialRequestOptions em JSON…"
          minHeight={180}
          maxHeight={400}
        />
      </Field>

      <Field
        label="Credencial"
        htmlFor="signing-credential"
        required
        hint={
          noCredentials
            ? `Nenhuma credencial neste modo. Crie uma na aba Criar credencial.`
            : undefined
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
              {noCredentials ? `Nenhuma credencial neste modo` : 'Selecione uma credencial…'}
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
          {loading ? 'Assinando…' : 'Assinar challenge'}
        </Button>
        {mode === 'hardware' && (
          <span className="text-xs text-[var(--muted-foreground)]">
            O navegador solicitará o autenticador.
          </span>
        )}
      </div>
    </div>
  )
}
