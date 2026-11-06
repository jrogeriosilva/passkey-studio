import { useState } from 'react'
import { ArrowDownUp, ArrowLeftRight, ArrowRightLeft } from 'lucide-react'
import { base64url } from '../utils/crypto'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { CopyButton } from './ui/copy-button'
import { CodeBlock } from './ui/code-block'
import { Alert } from './ui/alert'
import { Field } from './ui/field'
import { InlineCode } from './ui/inline-code'

export default function Base64Decoder() {
  const [input, setInput] = useState('')
  const [outputIsHex, setOutputIsHex] = useState(false)
  const [decodedBytes, setDecodedBytes] = useState<number | null>(null)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleDecode = () => {
    setError('')
    setOutputIsHex(false)
    setDecodedBytes(null)
    if (!input.trim()) { setError('Enter base64url to decode.'); return }
    try {
      const buffer = base64url.decode(input.trim())
      setDecodedBytes(buffer.byteLength)
      try {
        const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
        try { setOutput(JSON.stringify(JSON.parse(text), null, 2)) }
        catch { setOutput(text) }
      }
      catch { setOutput(Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('')); setOutputIsHex(true) }
    } catch {
      setError('Invalid base64url. Remove quotes and check the input.')
    }
  }

  const handleEncode = () => {
    setError('')
    setOutputIsHex(false)
    setDecodedBytes(null)
    if (!input.trim()) { setError('Enter text to encode.'); return }
    try {
      setOutput(base64url.encode(new TextEncoder().encode(input.trim())))
    } catch {
      setError('Could not encode the text.')
    }
  }

  const handleSwap = () => {
    setDecodedBytes(null)
    setOutputIsHex(false)
    setInput(output)
    setOutput(input)
    setError('')
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Input / Output panes */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch">
        <Field
          label="Input"
          htmlFor="base64-input"
          action={input ? <CopyButton value={input} size="xs" variant="ghost" /> : undefined}
        >
          <Textarea
            id="base64-input"
            value={input}
            onChange={e => { setInput(e.target.value); setError('') }}
            placeholder="Type text to encode or paste base64url to decode…"
            className="min-h-[200px] flex-1"
            autoGrow
          />
        </Field>

        <div className="flex items-center justify-center lg:pt-9">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap}
            disabled={!input && !output}
            title="Swap input and output"
            className="rounded-full"
          >
            <ArrowDownUp size={14} className="lg:hidden" />
            <ArrowLeftRight size={14} className="hidden lg:block" />
          </Button>
        </div>

        <Field
          label="Output"
          action={output ? <CopyButton value={output} size="xs" variant="ghost" /> : undefined}
        >
          <CodeBlock
            value={output}
            language="auto"
            placeholder="The result will appear here."
            className="min-h-[200px] flex-1"
            autoGrow
            maxHeight={320}
          />
        </Field>
      </div>

      {decodedBytes !== null && <p role="status" className="text-sm text-[var(--muted-foreground)]">{decodedBytes} {decodedBytes === 1 ? 'decoded byte' : 'decoded bytes'}</p>}
      {error && <Alert variant="destructive">{error}</Alert>}
      {outputIsHex && <Alert variant="info">The bytes are not UTF-8 text. The result is shown in hexadecimal.</Alert>}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleDecode}>
          <ArrowRightLeft size={14} />
          Decode base64url → text
        </Button>
        <Button variant="secondary" onClick={handleEncode}>
          Encode text → base64url
        </Button>
      </div>

      {/* Info */}
      <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
        Uses the base64url alphabet from RFC 4648 §5:{' '}
        <InlineCode>+</InlineCode> → <InlineCode>-</InlineCode>,{' '}
        <InlineCode>/</InlineCode> → <InlineCode>_</InlineCode>, without padding.
        FIDO2 and WebAuthn use this encoding for binary fields.
      </p>
    </div>
  )
}
