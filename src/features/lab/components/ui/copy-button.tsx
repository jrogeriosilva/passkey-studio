import * as React from 'react'
import { Copy, Check } from 'lucide-react'
import { Button, type ButtonProps } from './button'
import { cn } from '../../../../lib/utils'

interface CopyButtonProps extends Omit<ButtonProps, 'onClick'> {
  value: string
  label?: string
}

function CopyButton({ value, label, className, size = 'sm', variant = 'outline', ...props }: CopyButtonProps) {
  const [error, setError] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setError(false)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError(true)
    }
  }

  return (
    <span className="inline-flex flex-col gap-1"><Button
      aria-label={copied ? 'Copied' : (label || props.title || 'Copy JSON')}
      variant={variant}
      size={size}
      className={cn('gap-1.5', className)}
      onClick={handleCopy}
      {...props}
    >
      {copied ? (
        <Check size={14} className="text-[var(--success)]" />
      ) : (
        <Copy size={14} />
      )}
      {label && <span>{copied ? 'Copied' : label}</span>}
    </Button>{error && <span role="alert" className="text-xs text-[var(--destructive)]">Copy failed. Select and copy manually.</span>}</span>
  )
}

export { CopyButton }
