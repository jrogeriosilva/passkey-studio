import { useState } from "react"
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react"

const FIELD_HELP: Record<string, string> = {
  up: "user presence", uv: "user verified", be: "backup eligible", bs: "backup state", at: "attested data", ed: "extensions",
};
const COSE_HELP: Record<string, string> = { "1": "kty", "3": "alg", "-1": "crv / n", "-2": "x / e", "-3": "y" };

type Leaf = string | number | boolean | null

function isLeaf(value: unknown): value is Leaf {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopyError(false)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { setCopyError(true) }
  }

  return (
    <span>
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${label}`}
      aria-label={`Copy ${label}`}
      className="tree-copy items-center rounded-md border border-border/60 bg-card px-1 py-0.5 text-foreground/70 opacity-0 transition-[opacity,background-color,color] group-hover/line:opacity-100 hover:bg-foreground/10 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none [@media(hover:hover)]:inline-flex"
    >
      {copied ? (
        <Check className="size-3.5 text-success" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
    {copyError && <span role="alert" className="text-destructive">Copy failed. Select the value and copy manually.</span>}
    </span>
  )
}

function LeafValue({ value, label }: { value: Leaf; label: string }) {
  if (value === null) {
    return (
      <span className="group/val">
        <span className="text-tree-punct italic">null</span>
        <CopyButton label={label} text="null" />
      </span>
    )
  }
  if (typeof value === "boolean") {
    return (
      <span className="group/val">
        <span className={value ? "text-tree-true" : "text-tree-false"}>{String(value)}</span>
        <CopyButton label={label} text={String(value)} />
      </span>
    )
  }
  if (typeof value === "number") {
    return (
      <span className="group/val">
        <span className="text-tree-number tabular-nums">{value}</span>
        <CopyButton label={label} text={String(value)} />
      </span>
    )
  }
  return (
    <span className="group/val">
      <span className="text-tree-string break-all">"{value}"</span>
      <CopyButton label={label} text={value} />
    </span>
  )
}

interface ToggleProps {
  expanded: boolean
  onToggle: () => void
  summary: string
  label: string
}

function Toggle({ expanded, onToggle, summary, label }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
      className="inline-flex items-center gap-1 rounded-md px-1 align-middle text-tree-punct transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {expanded ? (
        <ChevronDown className="size-3.5" aria-hidden="true" />
      ) : (
        <ChevronRight className="size-3.5" aria-hidden="true" />
      )}
      {!expanded && <span className="text-[11px]">{summary}</span>}
    </button>
  )
}

/** Normalise a container value into labelled entries. Returns null for leaves/unknowns. */
function childEntries(value: unknown): { isArray: boolean; entries: [string, unknown][] } | null {
  if (Array.isArray(value)) {
    return { isArray: true, entries: value.map((item, i) => [String(i), item]) }
  }
  if (value !== null && typeof value === "object") {
    return { isArray: false, entries: Object.entries(value as Record<string, unknown>) }
  }
  return null
}

interface TreeRowProps {
  label: string
  labelKind: "key" | "index"
  value: unknown
  expandAll?: boolean
  parentLabel?: string
}

function TreeRow({ label, labelKind, value, expandAll, parentLabel }: TreeRowProps) {
  const [expanded, setExpanded] = useState(expandAll ?? !["rawEntries", "rawJSON", "x5c"].includes(label))
  const container = isLeaf(value) ? null : childEntries(value)

  let valueNode: React.ReactNode
  const foldedText = label === "rawJSON" && typeof value === "string"
  if (foldedText) {
    valueNode = <><Toggle label={label} expanded={expanded} onToggle={() => setExpanded(v => !v)} summary="JSON original" /><CopyButton label={label} text={value} />{expanded && <span className="block text-tree-string break-all">{value}</span>}</>
  } else if (isLeaf(value)) {
    valueNode = <LeafValue label={label} value={value} />
  } else if (!container) {
    valueNode = <span className="text-tree-punct">{String(value)}</span>
  } else if (container.entries.length === 0) {
    valueNode = <span className="text-tree-punct">{container.isArray ? "[]" : "{}"}</span>
  } else {
    const count = container.entries.length
    const summary = container.isArray
      ? `[${count} ${count === 1 ? "item" : "items"}]`
      : `{${count} ${count === 1 ? "field" : "fields"}}`
    valueNode = (
      <Toggle label={label} expanded={expanded} onToggle={() => setExpanded((v) => !v)} summary={summary} />
    )
  }

  const hasChildren = container !== null && container.entries.length > 0

  return (
    <div className="tree-row">
      <div className="tree-line group/line relative">
        <span className={labelKind === "key" ? "font-medium text-tree-key" : "text-tree-punct"}>
          {label}{(FIELD_HELP[label] || (parentLabel === "rawEntries" && COSE_HELP[label])) && <span className="text-xs font-normal text-muted-foreground"> ({FIELD_HELP[label] || COSE_HELP[label]})</span>}
        </span>
        <span className="text-tree-punct">: </span>
        {valueNode}
        {!isLeaf(value) && <CopyButton label={label} text={JSON.stringify(value, null, 2)} />}
      </div>
      {hasChildren && expanded && (
        <div className="tree-children">
          {container.entries.map(([key, val]) => (
            <TreeRow
              parentLabel={label}
              expandAll={expandAll}
              key={key}
              label={key}
              labelKind={container.isArray ? "index" : "key"}
              value={val}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export interface CopyableTreeViewProps {
  tree: Record<string, unknown>
  expandAll?: boolean
}

export function CopyableTreeView({ tree, expandAll }: CopyableTreeViewProps) {
  return (
    <div data-testid="decode-tree" className="decode-tree">
      {Object.entries(tree).map(([key, value]) => (
        <TreeRow expandAll={expandAll} key={key} label={key} labelKind="key" value={value} />
      ))}
    </div>
  )
}
