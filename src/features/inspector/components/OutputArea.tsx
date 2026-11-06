import { diagnostic } from "@/inspector/lib/diagnostics"
import { useState, type ReactNode } from "react"
import { Braces, Check, Copy, ScanSearch, TriangleAlert } from "lucide-react"
import type { DecodeResult, PayloadType } from "@/inspector/lib/types"
import { preprocessForTree } from "@/inspector/lib/tree-preprocess"
import { DecodeTreeView } from "@/inspector/components/DecodeTreeView"
import { Badge } from "@/inspector/components/ui/badge"
import { Button } from "@/inspector/components/ui/button"
import { payloadTypeLabel } from "@/inspector/lib/payload-type-detection"
import { cn } from "@/inspector/lib/utils"

type DetectedType = PayloadType | "publicKeyCredential"

interface OutputAreaProps {
  decodeResult: DecodeResult | null
  detectedType: DetectedType | null
}

/** Tinted badge per payload type so the detected kind is recognisable at a glance. */
const TYPE_BADGE_CLASS: Record<DetectedType, string> = {
  authenticatorData: "border-primary/30 bg-primary/10 text-primary",
  registration: "border-primary/30 bg-primary/10 text-primary",
  authentication: "border-tree-key/30 bg-tree-key/10 text-tree-key",
  clientDataJSON: "border-warning/30 bg-warning/10 text-warning",
  publicKeyCredential: "border-success/30 bg-success/10 text-success",
  "raw-cbor": "border-border bg-muted text-muted-foreground",
}

function CopyAllButton({ tree }: { tree: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(tree, null, 2))
      setCopyError(false)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { setCopyError(true) }
  }

  return (
    <div className="flex flex-col items-start gap-1">
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
      {copied ? (
        <><Check className="size-3.5 text-success" />Copiado</>
      ) : (
        <><Copy className="size-3.5" />Copiar tudo</>
      )}
    </Button>
    {copyError && <p role="alert" className="text-xs text-destructive">Falha ao copiar. Selecione a saída e copie manualmente.</p>}
    </div>
  )
}
interface OutputShellProps {
  children: ReactNode
  badge?: ReactNode
  actions?: ReactNode
  tone?: "default" | "error"
}

function OutputShell({ children, badge, actions, tone = "default" }: OutputShellProps) {
  return (
    <section
      aria-labelledby="output-heading"
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-sm shadow-black/20",
        tone === "error" ? "border-destructive/40" : "border-border"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Braces className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 id="output-heading" className="text-sm font-medium">
            Resultado
          </h2>
          {badge}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}

export function OutputArea({ decodeResult, detectedType }: OutputAreaProps) {
  const [encoding, setEncoding] = useState<"hex" | "base64url">("hex")
  const [expansion, setExpansion] = useState<{ all?: boolean; key: number }>({ key: 0 })
  if (!decodeResult) {
    return (
      <OutputShell>
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-muted-foreground">
            <ScanSearch className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium">Aguardando entrada</p>
            <p className="mt-1 max-w-sm text-sm text-pretty text-muted-foreground">
              Os campos decodificados aparecerão aqui.
            </p>
          </div>
        </div>
      </OutputShell>
    )
  }

  if (!decodeResult.ok) {
    return (
      <OutputShell tone="error">
        <div className="flex gap-3 px-4 py-5">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <TriangleAlert className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p role="alert" className="text-sm font-medium text-destructive">{diagnostic(decodeResult.error)}</p>
            {decodeResult.suggestion && (
              <p className="mt-1 text-sm text-pretty text-muted-foreground">{diagnostic(decodeResult.suggestion)}</p>
            )}
          </div>
        </div>
      </OutputShell>
    )
  }

  const { tree } = preprocessForTree(decodeResult, encoding)
  const auth = decodeResult.type === 'authenticatorData' ? decodeResult.data
    : decodeResult.type === 'attestationObject' ? decodeResult.data.authData
    : decodeResult.type === 'assertion' ? decodeResult.data.authenticatorData
    : decodeResult.type === 'publicKeyCredential' ? decodeResult.data.response.authenticatorData ?? decodeResult.data.response.attestationObject?.authData : undefined
  const client = decodeResult.type === 'clientDataJSON' ? decodeResult.data
    : decodeResult.type === 'assertion' ? decodeResult.data.clientDataJSON
    : decodeResult.type === 'publicKeyCredential' ? decodeResult.data.response.clientDataJSON : undefined

  return (
    <OutputShell
      badge={
        detectedType && (
          <Badge
            variant="outline"
            className={cn("font-mono text-[11px] whitespace-normal break-all", TYPE_BADGE_CLASS[detectedType])}
          >
            {payloadTypeLabel(detectedType)}
          </Badge>
        )
      }
      actions={<div className="flex flex-wrap items-center gap-2">
        <label className="text-xs">Bytes <select aria-label="Formato dos bytes" value={encoding} onChange={e => setEncoding(e.target.value as "hex" | "base64url")}><option>hex</option><option>base64url</option></select></label>
        <Button variant="ghost" size="sm" onClick={() => setExpansion(v => ({ all: true, key: v.key + 1 }))}>Expandir tudo</Button>
        <Button variant="ghost" size="sm" onClick={() => setExpansion(v => ({ all: false, key: v.key + 1 }))}>Recolher tudo</Button>
        <CopyAllButton tree={tree} />
      </div>}
    >
      {(auth || client) && <dl className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border px-4 py-3 text-xs">
        {client && <div><dt className="text-muted-foreground">Origem · cerimônia</dt><dd className="break-all">{client.origin} · {client.type}</dd></div>}
        {auth && <><div><dt className="text-muted-foreground">Contador</dt><dd>{auth.signCount}</dd></div><div><dt className="text-muted-foreground">Flags ativas</dt><dd>{Object.entries(auth.flags).filter(([key, value]) => key !== 'rawByte' && value === true).map(([key]) => key.toUpperCase()).join(' · ') || 'Nenhuma'}</dd></div></>}
      </dl>}
      <div className="overflow-x-auto px-3 py-3 sm:px-4">
        <DecodeTreeView key={expansion.key} tree={tree} expandAll={expansion.all} />
      </div>
    </OutputShell>
  )
}
