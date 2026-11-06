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
    if (!input.trim()) { setError('Informe base64url para decodificar.'); return }
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
      setError('Base64url inválido. Remova aspas e confira a entrada.')
    }
  }

  const handleEncode = () => {
    setError('')
    setOutputIsHex(false)
    setDecodedBytes(null)
    if (!input.trim()) { setError('Informe o texto para codificar.'); return }
    try {
      setOutput(base64url.encode(new TextEncoder().encode(input.trim())))
    } catch {
      setError('Não foi possível codificar o texto.')
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
          label="Entrada"
          htmlFor="base64-input"
          action={input ? <CopyButton value={input} size="xs" variant="ghost" /> : undefined}
        >
          <Textarea
            id="base64-input"
            value={input}
            onChange={e => { setInput(e.target.value); setError('') }}
            placeholder="Digite texto para codificar ou cole base64url para decodificar…"
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
            title="Trocar entrada e saída"
            className="rounded-full"
          >
            <ArrowDownUp size={14} className="lg:hidden" />
            <ArrowLeftRight size={14} className="hidden lg:block" />
          </Button>
        </div>

        <Field
          label="Saída"
          action={output ? <CopyButton value={output} size="xs" variant="ghost" /> : undefined}
        >
          <CodeBlock
            value={output}
            language="auto"
            placeholder="O resultado aparecerá aqui."
            className="min-h-[200px] flex-1"
            autoGrow
            maxHeight={320}
          />
        </Field>
      </div>

      {decodedBytes !== null && <p role="status" className="text-sm text-[var(--muted-foreground)]">{decodedBytes} {decodedBytes === 1 ? 'byte decodificado' : 'bytes decodificados'}</p>}
      {error && <Alert variant="destructive">{error}</Alert>}
      {outputIsHex && <Alert variant="info">Os bytes não são texto UTF-8. O resultado está em hexadecimal.</Alert>}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleDecode}>
          <ArrowRightLeft size={14} />
          Decodificar base64url → texto
        </Button>
        <Button variant="secondary" onClick={handleEncode}>
          Codificar texto → base64url
        </Button>
      </div>

      {/* Info */}
      <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
        Usa o alfabeto base64url da RFC 4648 §5:{' '}
        <InlineCode>+</InlineCode> → <InlineCode>-</InlineCode>,{' '}
        <InlineCode>/</InlineCode> → <InlineCode>_</InlineCode>, sem padding.
        FIDO2 e WebAuthn usam essa codificação nos campos binários.
      </p>
    </div>
  )
}
