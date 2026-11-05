interface ErrorMessageProps {
  error: string | null
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null

  return (
    <p className="text-xs font-mono text-destructive" role="alert">
      {error} Paste a complete credential JSON, base64url or hex value, or try Load sample.
    </p>
  )
}
