import { useState } from "react"
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react"

function CopyButton({ text }: { text: string }) {
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
    <span className="inline-flex shrink-0 items-center">
    <button
      onClick={handleCopy}
      title="Copy value"
      aria-label={copied ? 'Value copied' : 'Copy value'}
      className="tree-copy ml-1.5 inline-flex items-center gap-0.5 px-1 py-0.5 rounded opacity-0 group-hover/val:opacity-100 text-white bg-white/10 hover:bg-white/20 transition-opacity focus:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#84b0ff]"
    >
      {copied ? (
        <Check className="size-3.5 text-green-400" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
    {copyError && <span role="alert" className="text-xs text-destructive">Copy failed; select the value and copy manually.</span>}
    </span>
  )
}

function LeafValue({ value }: { value: string | number | boolean | null }) {
  if (value === null) {
    return (
      <span className="group/val inline-flex items-center">
        <span className="text-[#a3adbf]">null</span>
        <CopyButton text="null" />
      </span>
    )
  }
  if (typeof value === "boolean") {
    return (
      <span className="group/val inline-flex items-center">
        <span className="text-[#e5c07b]">{String(value)}</span>
        <CopyButton text={String(value)} />
      </span>
    )
  }
  if (typeof value === "number") {
    return (
      <span className="group/val inline-flex items-center">
        <span className="text-[#61afef]">{value}</span>
        <CopyButton text={String(value)} />
      </span>
    )
  }
  return (
    <span className="group/val inline-flex items-center min-w-0 max-w-full">
      <span className="text-[#98c379] min-w-0 break-all">"{value}"</span>
      <CopyButton text={value} />
    </span>
  )
}

interface TreeNodeProps {
  value: unknown
  path: string
}

function TreeNode({ value, path }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true)

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return <LeafValue value={value as string | number | boolean | null} />
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-[#a3adbf]">[]</span>
    }
    return (
      <span>
        <button
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${path}`}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="tree-toggle inline-flex items-center gap-0.5 text-[#a3adbf] hover:text-foreground transition-colors"
        >
          {expanded ? (
            <ChevronDown className="size-3" />
          ) : (
            <ChevronRight className="size-3" />
          )}
          <span className="text-xs">[{value.length}]</span>
        </button>
        {expanded && (
          <div className="tree-children">
            {value.map((item, i) => (
              <div key={i} className="py-px min-w-0 break-words">
                <span className="text-[#a3adbf]">{i}: </span>
                <TreeNode value={item} path={`${path}[${i}]`} />
              </div>
            ))}
          </div>
        )}
      </span>
    )
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) {
      return <span className="text-[#a3adbf]">{"{}"}</span>
    }
    return (
      <span>
        <button
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${path}`}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="tree-toggle inline-flex items-center gap-0.5 text-[#a3adbf] hover:text-foreground transition-colors"
        >
          {expanded ? (
            <ChevronDown className="size-3" />
          ) : (
            <ChevronRight className="size-3" />
          )}
        </button>
        {expanded && (
          <div className="tree-children">
            {entries.map(([key, val]) => (
              <div key={key} className="py-px min-w-0 break-words">
                <span className="text-[#e06c75] font-medium">{key}</span>
                <span className="text-[#a3adbf]">: </span>
                <TreeNode value={val} path={`${path}.${key}`} />
              </div>
            ))}
          </div>
        )}
      </span>
    )
  }

  return <span className="text-[#a3adbf]">{String(value)}</span>
}

export interface CopyableTreeViewProps {
  tree: Record<string, unknown>
}

export function CopyableTreeView({ tree }: CopyableTreeViewProps) {
  return (
    <div
      data-testid="decode-tree"
      className="decode-tree-container font-mono text-[13px] leading-relaxed"
    >
      <div>
        {Object.entries(tree).map(([key, value]) => (
          <div key={key} className="py-px min-w-0 break-words">
            <span className="text-[#e06c75] font-medium">{key}</span>
            <span className="text-[#a3adbf]">: </span>
            <TreeNode value={value} path={key} />
          </div>
        ))}
      </div>
    </div>
  )
}
