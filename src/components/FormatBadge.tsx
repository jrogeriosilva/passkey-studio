import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type InputFormat = "base64url" | "hex" | "cbor" | "json"

interface FormatBadgeProps {
  format: InputFormat | null
}

const DOT_COLOR: Record<InputFormat, string> = {
  base64url: "bg-primary",
  hex: "bg-warning",
  cbor: "bg-tree-key",
  json: "bg-success",
}

export function FormatBadge({ format }: FormatBadgeProps) {
  if (!format) return null

  return (
    <Badge variant="outline" className="gap-1.5 font-mono text-[11px] text-foreground/90">
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", DOT_COLOR[format])} />
      {format}
    </Badge>
  )
}
