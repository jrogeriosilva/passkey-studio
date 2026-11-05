import { useRef, useState, useMemo, useCallback, useEffect } from "react"
import { ClipboardPaste, Eraser } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { FormatBadge } from "@/components/FormatBadge"
import { ErrorMessage } from "@/components/ErrorMessage"
import { SamplePayloadsMenu } from "@/components/SamplePayloadsMenu"
import { detectAndNormalize, type FormatResult } from "@/lib/format-detection"
import { debounce } from "@/lib/debounce"
import { cn } from "@/lib/utils"
import type { SamplePayload } from "@/data/sample-payloads"

interface PayloadInputProps {
  onFormatResult: (result: FormatResult | null) => void
  onRawInput?: (raw: string) => void
}

const numberFormat = new Intl.NumberFormat("en-US")

export function PayloadInput({ onFormatResult, onRawInput }: PayloadInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState("")
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
        const r = detectAndNormalize(value)
        setResult(r)
        onFormatResult(r)
      }, 300),
    [onFormatResult]
  )

  useEffect(() => () => debouncedDetect.cancel(), [debouncedDetect])

  const detectImmediate = useCallback((value: string) => {
    debouncedDetect.cancel()
    if (!value.trim()) {
      setResult(null)
      onFormatResult(null)
      return
    }
    const r = detectAndNormalize(value)
    setResult(r)
    onFormatResult(r)
  }, [onFormatResult, debouncedDetect])

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
    onRawInput?.("")
    setResult(null)
    onFormatResult(null)
    if (textareaRef.current) {
      textareaRef.current.value = ""
      textareaRef.current.style.height = "auto"
      textareaRef.current.focus()
    }
  }

  const handleLoadSample = (sample: SamplePayload) => {
    setInput(sample.raw)
    onRawInput?.(sample.raw)
    requestAnimationFrame(adjustHeight)
    detectImmediate(sample.raw)
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
            Input
          </h2>
          <FormatBadge format={detectedFormat} />
        </div>
        <div className="flex items-center gap-1.5">
          <SamplePayloadsMenu onSelect={handleLoadSample} />
          {hasContent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              aria-label="Clear input"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Eraser className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <p id="payload-help" className="px-4 py-2 text-sm text-muted-foreground">Paste a credential JSON, base64url or hex value, or choose a sample. Decoding happens locally in your browser.</p>
      <Textarea aria-label="WebAuthn payload" aria-describedby="payload-help" aria-invalid={!!errorMessage}
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="Paste a base64url, hex or CBOR payload, or a full PublicKeyCredential JSON…"
        className="min-h-[140px] max-h-[320px] resize-none rounded-none border-0 bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
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
              {numberFormat.format(input.length)} chars
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
