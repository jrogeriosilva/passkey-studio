import { StorageTools } from './components/StorageTools'
import { useEffect, useState } from 'react'
import {
  Database,
  KeyRound,
  Signature,
  type LucideIcon,
} from 'lucide-react'
import CreateCredentialForm from './components/CreateCredentialForm'
import SigningPanel from './components/SigningPanel'
import AssertionDisplay from './components/AssertionDisplay'
import KeyGeneratorButton from './components/KeyGeneratorButton'
import CredentialManager from './components/CredentialManager'
import { cn } from '../../lib/utils'
import { Select } from './components/ui/select'
import { Alert } from './components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'

type Tab = 'create' | 'sign' | 'creds'
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
    label: 'Create credential',
    icon: KeyRound,
    title: 'Create credential',
    description: 'Register a credential using the PublicKeyCredentialCreationOptions from the server.',
    modeAware: true,
  },
  {
    id: 'sign',
    label: 'Sign',
    icon: Signature,
    title: 'Sign',
    description: 'Sign the server challenge and produce a WebAuthn assertion.',
    modeAware: true,
  },
  {
    id: 'creds',
    label: 'Credentials',
    icon: Database,
    title: 'Credentials and keys',
    description: 'Data in localStorage in this browser: key pairs and test credentials.',
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
  return <label className="flex flex-col gap-1 text-sm">Authenticator mode
    <Select value={mode} onChange={event => onChange(event.target.value as Mode)} className={mode === 'simulated' ? 'text-[var(--warning)]' : 'text-[var(--success)]'}>
      <option value="simulated">Simulated · SubtleCrypto</option>
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


<h1 className="text-2xl font-semibold">Experiment with WebAuthn</h1>
        {/* Tab navigation */}
        <nav aria-label="Tools" className="min-w-0">
          <div
            role="tablist"
            aria-label="Tools"
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
              ? 'For development and testing only. Simulated mode uses SubtleCrypto and stores unencrypted private keys in localStorage. Do not use production credentials.'
              : <>Hardware: navigator.credentials calls a real authenticator. The private key stays in the authenticator; the RP ID must match this page's origin.{window.location.hostname === '127.0.0.1' && <> For local development, <a className="underline" href={window.location.href.replace('127.0.0.1', 'localhost')}>open on localhost</a> and restore the sample to use an RP ID accepted by the browser.</>}</>}</Alert></div>}
            <section hidden={activeTab !== 'create'} aria-label="Create credential">
              <CreateCredentialForm mode={mode} onCredentialCreated={handleCredentialCreated} />
            </section>

            <section hidden={activeTab !== 'sign'} aria-label="Sign">
              <div className="flex flex-col gap-6">
                <SigningPanel mode={mode} refreshKey={refreshKey} onAssertionGenerated={handleAssertionGenerated} />
                {assertion && (
                  <div className="border-t border-[var(--border)] pt-6">
                    <AssertionDisplay assertion={assertion} />
                  </div>
                )}
              </div>
            </section>

            <section hidden={activeTab !== 'creds'}>
              <div className="flex flex-col gap-6">
                {mode === 'simulated' && (
                  <section className="flex flex-col gap-4">
                    <SectionHeading
                      icon={KeyRound}
                      title="Key generator"
                      description="Generate optional ES256 or RS256 key pairs for simulated credentials."
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
                    title="Stored credentials"
                    description="Registered credentials, their metadata and public keys."
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
