import { useState, useEffect } from 'react'
import { Check, ChevronRight, KeyRound, LoaderCircle, Trash2 } from 'lucide-react'
import { generateKeyPairForStorage } from '../utils/fido2Simulator'
import { publicCredential, clearAllGeneratedKeys, saveGeneratedKey, getGeneratedKeys, deleteGeneratedKey, type GeneratedKey } from '../utils/localStorage'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Select } from './ui/select'
import { CopyButton } from './ui/copy-button'
import { EmptyState } from './ui/empty-state'
import { cn } from '@/lab/lib/utils'

interface Props {
  refreshKey?: number
  onKeyGenerated?: (key?: GeneratedKey) => void
}

export default function KeyGeneratorButton({ onKeyGenerated, refreshKey }: Props) {
  const [algorithm, setAlgorithm] = useState('ES256')
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [keys, setKeys] = useState<GeneratedKey[]>(() => getGeneratedKeys())
  const [showKeys, setShowKeys] = useState(() => getGeneratedKeys().length > 0)

  useEffect(() => { setKeys(getGeneratedKeys()) }, [refreshKey])

  const refresh = () => setKeys(getGeneratedKeys())

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setFlash(null)
    try {
      const keyPair = await generateKeyPairForStorage(algorithm)
      if (!saveGeneratedKey(keyPair)) throw new Error('Não foi possível salvar a chave. Confira o armazenamento do navegador e tente novamente.')
      refresh()
      setShowKeys(true)
      setFlash(`${algorithm} par de chaves gerado`)
      setTimeout(() => setFlash(null), 1500)
      onKeyGenerated?.(keyPair)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('Excluir esta chave simulada?')) return
    if (!deleteGeneratedKey(id)) { setError('Não foi possível excluir a chave.'); return }
    refresh()
    onKeyGenerated?.()
  }

  const available = keys.filter(k => !k.used).length

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
        <Select
          value={algorithm}
          onChange={e => setAlgorithm(e.target.value)}
          wrapperClassName="sm:w-56"
          className="font-mono"
          aria-label="Algoritmo da chave"
        >
          <option value="ES256">ES256 · ECDSA P-256</option>
          <option value="RS256">RS256 · RSA 2048</option>
        </Select>

        <Button variant="secondary" onClick={handleGenerate} disabled={loading} className="h-9">
          {loading ? <LoaderCircle size={14} className="animate-spin" /> : <KeyRound size={14} />}
          {loading ? 'Gerando…' : 'Gerar par de chaves'}
        </Button>

        <div className="flex items-center gap-2 sm:ml-auto">
          {flash && (
            <Badge variant="success" className="animate-in fade-in-0 zoom-in-95 duration-200">
              <Check />
              {flash}
            </Badge>
          )}
          {error && (
            <span className="text-xs text-[var(--destructive)]">{error}</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { if (!showKeys) refresh(); setShowKeys(s => !s) }}
            aria-expanded={showKeys}
            className="text-[var(--muted-foreground)]"
          >
            <ChevronRight
              size={13}
              className={cn('transition-transform duration-200', showKeys && 'rotate-90')}
            />
            {keys.length} chave{keys.length !== 1 ? 's' : ''}
            {keys.length > 0 && (
              <span className="text-[var(--muted-foreground)]/70">· {available} disponíveis</span>
            )}
          </Button>
        </div>
      </div>

      {keys.length > 0 && <Button variant="ghost" onClick={() => { if (confirm('Excluir todas as chaves simuladas?')) { if (clearAllGeneratedKeys()) { refresh(); onKeyGenerated?.() } else setError('Não foi possível excluir as chaves.') } }}>Excluir todas as chaves</Button>}
      {/* Key list */}
      {showKeys && (
        <div className="flex flex-col gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {keys.length === 0 ? (
            <EmptyState
              icon={<KeyRound size={18} />}
              title="Nenhum par de chaves"
              description="Gere um par de chaves. Chaves disponíveis podem ser vinculadas a uma credencial simulada."
              className="py-8"
            />
          ) : (
            keys.map(key => (
              <div
                key={key.id}
                className="flex items-center gap-3 border-b border-[var(--border)] px-3 py-2.5 transition-colors hover:border-[oklch(1_0_0/16%)]"
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                    key.used
                      ? 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
                      : 'bg-[var(--brand)]/12 text-[var(--brand)]',
                  )}
                >
                  <KeyRound size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="max-w-full truncate font-mono text-xs font-medium" title={key.id}>
                      {key.id}
                    </span>
                    <Badge variant="secondary" className="font-mono">{key.algorithm}</Badge>
                    <Badge variant={key.used ? 'outline' : 'success'}>
                      {key.used ? 'Usada' : 'Disponível'}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    Criada em {new Date(key.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <CopyButton
                    value={JSON.stringify(publicCredential(key), null, 2)}
                    size="icon-sm"
                    variant="ghost"
                    title="Copiar JSON público da chave"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(key.id)}
                    title="Excluir chave"
                    className="text-[var(--muted-foreground)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
