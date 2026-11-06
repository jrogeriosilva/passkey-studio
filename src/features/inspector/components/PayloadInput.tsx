import { useRef, useState, useMemo, useCallback, useEffect } from "react"
import { ClipboardPaste, Eraser } from "lucide-react"
import { Textarea } from "@/inspector/components/ui/textarea"
import { Button } from "@/inspector/components/ui/button"
import { FormatBadge } from "@/inspector/components/FormatBadge"
import { ErrorMessage } from "@/inspector/components/ErrorMessage"
import { SamplePayloadsMenu } from "@/inspector/components/SamplePayloadsMenu"
import { detectAndNormalize, type FormatResult } from "@/inspector/lib/format-detection"
import { debounce } from "@/inspector/lib/debounce"
import { cn } from "@/inspector/lib/utils"
import type { SamplePayload } from "@/inspector/data/sample-payloads"

interface PayloadInputProps {
  incomingInput?: { value: string; key: number }
  onFormatResult: (result: FormatResult | null) => void
  onRawInput?: (raw: string) => void
}

const numberFormat = new Intl.NumberFormat("pt-BR")

export function PayloadInput({ incomingInput, onFormatResult, onRawInput }: PayloadInputProps) {
  const lastIncomingKey = useRef<number | undefined>(undefined)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState("")
  const [format, setFormat] = useState<"auto" | "base64url" | "hex" | "json">("auto")
  const [previousInput, setPreviousInput] = useState<string | null>(null)
  const [result, setResult] = useState<FormatResult | null>(null)

  const detectedFormat = result?.ok ? result.format : null
  const errorMessage = result && !result.ok ? result.error : null
  const byteLength = result?.ok ? result.bytes.byteLength : null

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`
  }, [])

  const debouncedDetect = useMemo(
    () =>
      debounce((value: string) => {
        if (!value.trim()) {
          setResult(null)
          onFormatResult(null)
          return
        }
        const r = detectAndNormalize(value, format)
        setResult(r)
        onFormatResult(r)
      }, 300),
    [onFormatResult, format]
  )

  useEffect(() => () => debouncedDetect.cancel(), [debouncedDetect])

  const detectImmediate = useCallback((value: string, chosenFormat = format) => {
    debouncedDetect.cancel()
    if (!value.trim()) {
      setResult(null)
      onFormatResult(null)
      return
    }
    const r = detectAndNormalize(value, chosenFormat)
    setResult(r)
    onFormatResult(r)
  }, [onFormatResult, debouncedDetect, format])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)
    onRawInput?.(value)
    adjustHeight()
    debouncedDetect(value)
  }

  const handlePaste = () => {
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      setInput(el.value)
      onRawInput?.(el.value)
      adjustHeight()
      detectImmediate(el.value)
    })
  }

  const handleClear = () => {
    debouncedDetect.cancel()
    setInput("")
    setPreviousInput(null)
    onRawInput?.("")
    setResult(null)
    onFormatResult(null)
    if (textareaRef.current) {
      textareaRef.current.value = ""
      textareaRef.current.style.height = "auto"
      textareaRef.current.focus()
    }
  }

  useEffect(() => {
    if (!incomingInput || lastIncomingKey.current === incomingInput.key) return
    lastIncomingKey.current = incomingInput.key
    setFormat("auto")
    setInput(incomingInput.value)
    onRawInput?.(incomingInput.value)
    detectImmediate(incomingInput.value, "auto")
    requestAnimationFrame(adjustHeight)
  }, [incomingInput, onRawInput, detectImmediate, adjustHeight])

  const handleLoadSample = (sample: SamplePayload) => {
    setFormat("auto")
    setPreviousInput(input)
    setInput(sample.raw)
    onRawInput?.(sample.raw)
    requestAnimationFrame(adjustHeight)
    detectImmediate(sample.raw, "auto")
  }

  const hasContent = input.length > 0

  return (
    <section
      aria-labelledby="input-heading"
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-sm shadow-black/20 transition-[border-color,box-shadow]",
        "focus-within:ring-3",
        errorMessage
          ? "border-destructive/50 focus-within:border-destructive/60 focus-within:ring-destructive/20"
          : "border-border focus-within:border-ring/60 focus-within:ring-ring/20"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <ClipboardPaste className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 id="input-heading" className="text-sm font-medium">
            Entrada
          </h2>
          <FormatBadge format={detectedFormat} />
          <label className="text-xs">Formato <select aria-label="Formato de entrada" value={format} onChange={event => {
            const next = event.target.value as typeof format; setFormat(next); debouncedDetect.cancel();
            if (input.trim()) { const result = detectAndNormalize(input, next); setResult(result); onFormatResult(result) }
          }}><option value="auto">Automático</option><option value="base64url">base64url</option><option value="hex">hex</option><option value="json">JSON</option></select></label>
        </div>
        <div className="flex items-center gap-1.5">
          {previousInput !== null && <Button variant="ghost" size="sm" onClick={() => {
            setInput(previousInput); onRawInput?.(previousInput); detectImmediate(previousInput); setPreviousInput(null)
          }}>Desfazer exemplo</Button>}
          <SamplePayloadsMenu onSelect={handleLoadSample} />
          {hasContent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              aria-label="Limpar entrada"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Eraser className="size-3.5" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      <Textarea aria-label="Payload WebAuthn" aria-describedby="payload-privacy" aria-invalid={!!errorMessage}
        onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); detectImmediate(input) } }}
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="Cole JSON PublicKeyCredential, clientDataJSON, base64url ou hex…"
        className="min-h-[140px] max-h-[320px] resize-none rounded-none border-0 bg-transparent px-4 py-3 font-mono text-base leading-relaxed focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />

      {(hasContent || errorMessage) && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border/60 px-3 py-1.5 text-xs text-muted-foreground sm:px-4">
          <ErrorMessage error={errorMessage} />
          {hasContent && (
            <span className="ml-auto font-mono tabular-nums">
              {numberFormat.format(input.length)} caracteres
              {byteLength !== null && (
                <>
                  <span className="mx-1.5 opacity-50">·</span>
                  {numberFormat.format(byteLength)} bytes
                </>
              )}
            </span>
          )}
        </div>
      )}
    </section>
  )
}
