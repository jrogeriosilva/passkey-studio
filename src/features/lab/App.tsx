import { StorageTools } from './components/StorageTools'
import { useEffect, useState } from 'react'
import {
  Binary,
  Cpu,
  Database,
  KeyRound,
  ScanSearch,
  Signature,
  Usb,
  type LucideIcon,
} from 'lucide-react'
import CreateCredentialForm from './components/CreateCredentialForm'
import SigningPanel from './components/SigningPanel'
import AssertionDisplay from './components/AssertionDisplay'
import KeyGeneratorButton from './components/KeyGeneratorButton'
import CredentialManager from './components/CredentialManager'
import Base64Decoder from './components/Base64Decoder'
import AttestationObjectDecoder from './components/AttestationObjectDecoder'
import { cn } from './lib/utils'
import { Select } from './components/ui/select'
import { Alert } from './components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'

type Tab = 'create' | 'sign' | 'base64' | 'attest' | 'creds'
type Mode = 'simulated' | 'hardware'


interface TabDef {
  id: Tab
  label: string
  icon: LucideIcon
  title: string
  description: string
  /** Whether the panel's behaviour depends on the selected authenticator mode. */
  modeAware: boolean
}

const TABS: TabDef[] = [
  {
    id: 'create',
    label: 'Criar credencial',
    icon: KeyRound,
    title: 'Criar credencial',
    description: 'Registre uma credencial com as opções PublicKeyCredentialCreationOptions do servidor.',
    modeAware: true,
  },
  {
    id: 'sign',
    label: 'Assinar',
    icon: Signature,
    title: 'Assinar',
    description: 'Assine o challenge do servidor e produza uma assertion WebAuthn.',
    modeAware: true,
  },
  {
    id: 'base64',
    label: 'Base64url',
    icon: Binary,
    title: 'Conversor base64url',
    description: 'Converta texto e bytes em base64url, a codificação usada por WebAuthn.',
    modeAware: false,
  },
  {
    id: 'attest',
    label: 'Atestação',
    icon: ScanSearch,
    title: 'Atestação',
    description: 'Examine formato, dados do autenticador e declaração de um attestationObject.',
    modeAware: false,
  },
  {
    id: 'creds',
    label: 'Credenciais',
    icon: Database,
    title: 'Credenciais e chaves',
    description: 'Dados em localStorage deste navegador: pares de chaves e credenciais de teste.',
    modeAware: true,
  },
]

interface AssertionData {
  id: string
  rawId: string
  response: Record<string, string | null>
  algorithm?: string
  credentialId?: string
}

function ModeMenu({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return <label className="flex flex-col gap-1 text-sm">Modo do autenticador
    <Select value={mode} onChange={event => onChange(event.target.value as Mode)} className={mode === 'simulated' ? 'text-[var(--warning)]' : 'text-[var(--success)]'}>
      <option value="simulated">Simulado · SubtleCrypto</option>
      <option value="hardware">Hardware · WebAuthn</option>
    </Select>
  </label>
}

function SectionHeading({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--brand)]">
        <Icon size={14} />
      </span>
      <div>
        <h3 className="text-sm font-semibold leading-tight">{title}</h3>
        <p className="mt-0.5 text-xs leading-snug text-[var(--muted-foreground)]">{description}</p>
      </div>
    </div>
  )
}

export default function App() {
  const [mode, setMode] = useState<Mode>('simulated')
  const [assertion, setAssertion] = useState<AssertionData | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('create')

  const handleCredentialCreated = () => setRefreshKey(k => k + 1)
  const handleAssertionGenerated = (a: AssertionData) => setAssertion(a)

  useEffect(() => {
    const sign = () => setActiveTab('sign')
    window.addEventListener('studio:sign', sign)
    return () => window.removeEventListener('studio:sign', sign)
  }, [])

  const current = TABS.find(t => t.id === activeTab) ?? TABS[0]
  const CurrentIcon = current.icon

  return (
    <div className="relative flex min-h-screen flex-col">

      {/* Main content */}
      <main id="top" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 sm:gap-6 px-4 pb-12 pt-5 sm:pb-16 sm:pt-8">


<h1 className="text-2xl font-semibold">Experimentar WebAuthn</h1>
        {/* Tab navigation */}
        <nav aria-label="Ferramentas" className="min-w-0">
          <div
            role="tablist"
            aria-label="Ferramentas"
            className="flex flex-wrap items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1"
          >
            {TABS.map(tab => {
              const active = tab.id === activeTab
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-controls="tool-panel"
                  aria-selected={active}
                  tabIndex={active ? 0 : -1}
                  onKeyDown={e => {
                    const index = TABS.findIndex(t => t.id === tab.id)
                    const next = e.key === 'ArrowRight' ? (index + 1) % TABS.length : e.key === 'ArrowLeft' ? (index + TABS.length - 1) % TABS.length : e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : -1
                    if (next < 0) return
                    e.preventDefault()
                    setActiveTab(TABS[next].id)
                    const tabs = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                    tabs?.[next].focus()
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex min-h-11 shrink-0 sm:flex-auto items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--ring)]/40',
                    active
                      ? 'bg-[var(--secondary)] text-[var(--foreground)]'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 hover:text-[var(--foreground)]',
                  )}
                >
                  <Icon size={15} className={active ? 'text-[var(--brand)]' : undefined} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Active panel */}
        <Card
          role="tabpanel"
          id="tool-panel"
          aria-labelledby={`tab-${activeTab}`}
        >
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-[var(--brand)]">
                <CurrentIcon size={16} />
              </span>
              <div className="flex flex-col gap-1">
                <CardTitle>{current.title}</CardTitle>
                <CardDescription>{current.description}</CardDescription>
              </div>
            </div>
            {current.modeAware && <ModeMenu mode={mode} onChange={next => { setMode(next); setAssertion(null) }} />}
          </CardHeader>

          <CardContent>
            {current.modeAware && <div className="mb-5"><Alert variant={mode === 'simulated' ? 'warning' : 'info'}>{mode === 'simulated'
              ? 'Somente desenvolvimento e testes. O modo simulado usa SubtleCrypto e grava chaves privadas sem criptografia em localStorage. Não use credenciais de produção.'
              : <>Hardware: navigator.credentials aciona um autenticador real. A chave privada permanece no autenticador; o RP ID deve corresponder à origem desta página.{window.location.hostname === '127.0.0.1' && <> Para desenvolvimento local, <a className="underline" href={window.location.href.replace('127.0.0.1', 'localhost')}>abra em localhost</a> e restaure o exemplo para usar um RP ID aceito pelo navegador.</>}</>}</Alert></div>}
            <section hidden={activeTab !== 'create'} aria-label="Criar credencial">
              <CreateCredentialForm mode={mode} onCredentialCreated={handleCredentialCreated} />
            </section>

            <section hidden={activeTab !== 'sign'} aria-label="Assinar">
              <div className="flex flex-col gap-6">
                <SigningPanel mode={mode} refreshKey={refreshKey} onAssertionGenerated={handleAssertionGenerated} />
                {assertion && (
                  <div className="border-t border-[var(--border)] pt-6">
                    <AssertionDisplay assertion={assertion} />
                  </div>
                )}
              </div>
            </section>

            <section hidden={activeTab !== 'base64'}><Base64Decoder /></section>

            <section hidden={activeTab !== 'attest'}><AttestationObjectDecoder /></section>

            <section hidden={activeTab !== 'creds'}>
              <div className="flex flex-col gap-6">
                {mode === 'simulated' && (
                  <section className="flex flex-col gap-4">
                    <SectionHeading
                      icon={KeyRound}
                      title="Gerador de chaves"
                      description="Gere pares ES256 ou RS256 opcionais para credenciais simuladas."
                    />
                    <KeyGeneratorButton refreshKey={refreshKey} onKeyGenerated={handleCredentialCreated} />
                  </section>
                )}
                <section
                  className={cn(
                    'flex flex-col gap-4',
                    mode === 'simulated' && 'border-t border-[var(--border)] pt-6',
                  )}
                >
                  <SectionHeading
                    icon={Database}
                    title="Credenciais armazenadas"
                    description="Credenciais registradas, seus metadados e chaves públicas."
                  />
                  <CredentialManager refreshKey={refreshKey} />
                  <StorageTools onChange={handleCredentialCreated} />
                </section>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
