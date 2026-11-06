import { useState, useEffect } from 'react'
import { ChevronRight, Cpu, Database, Trash2, Usb } from 'lucide-react'
import { publicCredential, getCredentials, deleteCredential, clearAllCredentials, type StoredCredential } from '../utils/localStorage'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { CopyButton } from './ui/copy-button'
import { EmptyState } from './ui/empty-state'
import JsonDisplay from './JsonDisplay'
import { cn } from '@/lab/lib/utils'

interface Props {
  refreshKey: number
}

function CredentialRow({ credential, onDelete }: { credential: StoredCredential; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const isSimulated = credential.type === 'simulated'
  const Icon = isSimulated ? Cpu : Usb
  const hasPublicKey = Boolean(credential.publicKeyJWK)

  const meta: [string, string | undefined][] = [
    ['RP ID', credential.rpId],
    ['Pessoa', credential.userName || credential.userId],
    ['ID da pessoa', credential.userId],
    ['Criada em', credential.createdAt ? new Date(credential.createdAt).toLocaleString('pt-BR') : undefined],
  ]

  return (
    <article
      className="border-b border-[var(--border)] transition-colors hover:border-[oklch(1_0_0/16%)]"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <span
          className={cn(
            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            isSimulated
              ? 'bg-[var(--warning)]/12 text-[var(--warning)]'
              : 'bg-[var(--brand)]/12 text-[var(--brand)]',
          )}
        >
          <Icon size={16} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className="max-w-full truncate font-mono text-[13px] font-medium"
              title={credential.id}
            >
              {credential.id}
            </span>
            <Badge variant="secondary" className="font-mono">{credential.algorithm}</Badge>
            <Badge variant={isSimulated ? 'warning' : 'brand'}>{isSimulated ? 'Simulada' : 'Hardware'}</Badge>
          </div>

          <dl className="mt-2.5 grid grid-cols-1 gap-x-6 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
            {meta.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  {k}
                </dt>
                <dd className="truncate font-mono text-[var(--foreground)]/85" title={v}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <CopyButton
            value={JSON.stringify(publicCredential(credential), null, 2)}
            size="icon-sm"
            variant="ghost"
            title="Copiar JSON público da credencial"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            title="Excluir credencial"
            className="text-[var(--muted-foreground)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {hasPublicKey && (
        <div className="border-t border-[var(--border)]">
          <button
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
            className="flex w-full items-center gap-1.5 px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            <ChevronRight
              size={13}
              className={cn('transition-transform duration-200', expanded && 'rotate-90')}
            />
            Chave pública (JWK)
          </button>
          {expanded && (
            <div className="px-4 pb-3 animate-in fade-in-0 duration-200">
              <JsonDisplay data={credential.publicKeyJWK} maxHeight={320} />
            </div>
          )}
        </div>
      )}
    </article>
  )
}

export default function CredentialManager({ refreshKey }: Props) {
  const [error, setError] = useState('')
  const [credentials, setCredentials] = useState<StoredCredential[]>([])

  useEffect(() => {
    setCredentials(getCredentials())
  }, [refreshKey])

  const handleDelete = (id: string) => {
    if (!confirm('Excluir esta credencial?')) return
    if (!deleteCredential(id)) { setError('Não foi possível excluir a credencial.'); return }
    setCredentials(getCredentials())
  }

  const handleClearAll = () => {
    if (!confirm('Excluir TODAS as credenciais?')) return
    if (!clearAllCredentials()) { setError('Não foi possível excluir as credenciais.'); return }
    setCredentials([])
  }

  if (credentials.length === 0) {
    return (
      <EmptyState
        icon={<Database size={18} />}
        title="Nenhuma credencial armazenada"
        description="Crie uma credencial na aba Criar credencial para ver seus metadados e chave pública."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p role="alert">{error}</p>}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--muted-foreground)]">
          <span className="font-semibold text-[var(--foreground)]">{credentials.length}</span>
          {' '}{credentials.length === 1 ? 'credencial armazenada' : 'credenciais armazenadas'}
        </span>
        <Button variant="destructive" size="sm" onClick={handleClearAll}>
          <Trash2 size={13} />
          Excluir todas
        </Button>
      </div>
      {credentials.map(c => (
        <CredentialRow key={c.id} credential={c} onDelete={() => handleDelete(c.id)} />
      ))}
    </div>
  )
}
