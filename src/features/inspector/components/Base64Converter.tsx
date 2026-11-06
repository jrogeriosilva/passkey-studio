import { useState } from "react"
import { ArrowDownUp, Check, Copy } from "lucide-react"
import { base64 } from "@hexagon/base64"
import { Button } from "@/inspector/components/ui/button"
import { Textarea } from "@/inspector/components/ui/textarea"
import { detectAndNormalize } from "@/inspector/lib/format-detection"

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const copied = copiedValue === value

  return <div className="flex flex-col items-end gap-1">
    <Button variant="ghost" className="min-h-11" disabled={!value} aria-label={label} onClick={async () => {
      try {
        await navigator.clipboard.writeText(value)
        setError(false)
        setCopiedValue(value)
        setTimeout(() => setCopiedValue(null), 1500)
      } catch { setError(true) }
    }}>
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span role="status">{copied ? "Copied" : "Copy"}</span>
    </Button>
    {error && <p role="alert" className="text-xs text-destructive">Copy failed. Select the text and copy it manually.</p>}
  </div>
}

export default function Base64Converter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [outputIsHex, setOutputIsHex] = useState(false)
  const [decodedBytes, setDecodedBytes] = useState<number | null>(null)
  const [error, setError] = useState("")

  const resetResult = () => {
    setOutput("")
    setOutputIsHex(false)
    setDecodedBytes(null)
    setError("")
  }

  const handleDecode = () => {
    resetResult()
    if (!input.trim()) { setError("Enter base64url to decode."); return }
    const result = detectAndNormalize(input, "base64url")
    if (!result.ok || input.trim().length % 4 === 1) { setError("Invalid base64url. Remove quotes and check the input."); return }
    const buffer = result.bytes
    setDecodedBytes(buffer.byteLength)
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer)
      try { setOutput(JSON.stringify(JSON.parse(text), null, 2)) }
      catch { setOutput(text) }
    } catch {
      setOutput(Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, "0")).join(""))
      setOutputIsHex(true)
    }
  }

  const handleEncode = () => {
    resetResult()
    if (!input) { setError("Enter text to encode."); return }
    setOutput(base64.fromArrayBuffer(new TextEncoder().encode(input).buffer, true))
  }

  return <section aria-labelledby="converter-heading" className="pb-6">
    <h2 id="converter-heading" className="text-lg font-semibold">Base64url converter</h2>
    <p id="converter-help" className="mt-1 max-w-prose text-sm text-muted-foreground">Encode text or decode base64url. Binary data is shown as hexadecimal.</p>

    <div className="mt-5 grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card focus-within:border-ring">
        <div className="flex min-h-14 items-center justify-between gap-2 border-b border-border px-4">
          <label htmlFor="base64-input" className="text-sm font-medium">Input</label>
          <CopyValue value={input} label="Copy input" />
        </div>
        <Textarea id="base64-input" value={input} aria-describedby={error ? "converter-help converter-error" : "converter-help"} aria-invalid={!!error}
          onChange={event => { setInput(event.target.value); resetResult() }}
          placeholder="Type text to encode or paste base64url to decode…"
          className="h-56 max-h-80 resize-y rounded-none border-0 bg-transparent px-4 py-3 font-mono text-base [field-sizing:fixed] dark:bg-transparent"
          spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" />
      </div>

      <div className="flex items-center justify-center">
        <Button variant="outline" className="min-h-11 gap-2" disabled={!output} onClick={() => {
          const previousInput = input
          setInput(output)
          resetResult()
          setOutput(previousInput)
        }}>
          <ArrowDownUp aria-hidden="true" />Swap
        </Button>
      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card focus-within:border-ring">
        <div className="flex min-h-14 items-center justify-between gap-2 border-b border-border px-4">
          <label htmlFor="base64-output" className="text-sm font-medium">Output{outputIsHex ? " · hex" : ""}</label>
          <CopyValue value={output} label="Copy output" />
        </div>
        <Textarea id="base64-output" value={output} readOnly placeholder="The result will appear here."
          className="h-56 max-h-80 resize-y rounded-none border-0 bg-transparent px-4 py-3 font-mono text-base [field-sizing:fixed] dark:bg-transparent" />
      </div>
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      <Button className="min-h-11 hover:bg-primary/80" onClick={handleDecode}>Decode base64url → text</Button>
      <Button variant="secondary" className="min-h-11" onClick={handleEncode}>Encode text → base64url</Button>
    </div>
    {error && <p id="converter-error" role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    <div role="status" className="mt-3 text-sm text-muted-foreground">
      {decodedBytes !== null && <p>{decodedBytes} {decodedBytes === 1 ? "decoded byte" : "decoded bytes"}</p>}
      {outputIsHex && <p>The bytes are not UTF-8 text. The result is shown in hexadecimal.</p>}
    </div>
    <p className="mt-4 max-w-prose text-xs leading-relaxed text-muted-foreground">WebAuthn uses base64url: the Base64 alphabet with <code>-</code> and <code>_</code> instead of <code>+</code> and <code>/</code>, without padding.</p>
  </section>
}
