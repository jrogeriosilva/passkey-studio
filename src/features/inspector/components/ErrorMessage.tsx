import { CircleAlert } from "lucide-react"

interface ErrorMessageProps {
  error: string | null
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null

  return (
    <p className="flex items-start gap-1.5 font-mono text-xs text-destructive" role="alert">
      <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      <span>{error} Paste a complete credential JSON, base64url or hex value, or try Load sample.</span>
    </p>
  )
}
