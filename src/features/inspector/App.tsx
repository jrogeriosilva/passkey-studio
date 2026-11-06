import { useState, useMemo, useEffect, useRef } from "react"
import { HeroIntro } from "@/inspector/components/HeroIntro"
import { PayloadInput } from "@/inspector/components/PayloadInput"
import { OutputArea } from "@/inspector/components/OutputArea"
import { decodeFullCredential } from "@/inspector/lib/decode-orchestrator"
import { autoDetectAndDecode } from "@/inspector/lib/payload-type-detection"
import { tryExtractPublicKeyCredential } from "@/inspector/lib/publickeycredential-input"
import type { PayloadType, DecodeResult } from "@/inspector/lib/types"
type DetectedType = PayloadType | "publicKeyCredential"
import { getSamplePayloads } from "@/inspector/data/sample-payloads"
import type { FormatResult } from "@/inspector/lib/format-detection"
import Base64Converter from "@/inspector/components/Base64Converter"
import { cn } from "@/inspector/lib/utils"

const tools = [
  { id: "webauthn", label: "WebAuthn" },
  { id: "base64url", label: "Base64url" },
] as const

function App({ incomingInput }: { incomingInput?: { value: string; key: number } }) {
  const [activeTool, setActiveTool] = useState<typeof tools[number]["id"]>("webauthn")
  const [incoming, setIncoming] = useState(incomingInput)
  const loadedSource = useRef<string | number | undefined>(undefined)
  useEffect(() => {
    const load = () => {
      const sampleId = new URLSearchParams(window.location.search).get("sample")
      const sample = getSamplePayloads().find(item => item.id === sampleId)
      if (sample) setActiveTool("webauthn")
      const source = sample ? `sample:${sample.id}` : incomingInput?.key
      if (loadedSource.current === source) return
      loadedSource.current = source
      if (sample) setIncoming({ value: sample.raw, key: Date.now() })
      else if (incomingInput) {
        setIncoming(incomingInput)
        setActiveTool("webauthn")
      }
    }
    load()
    window.addEventListener('studio:location', load)
    return () => window.removeEventListener('studio:location', load)
  }, [incomingInput])
  const [formatResult, setFormatResult] = useState<FormatResult | null>(null)
  const [rawInput, setRawInput] = useState("")

  const { detectedType, decodeResult } = useMemo((): {
    detectedType: DetectedType | null
    decodeResult: DecodeResult | null
  } => {
    const envelope = tryExtractPublicKeyCredential(rawInput)
    if (envelope) {
      return { detectedType: "publicKeyCredential", decodeResult: decodeFullCredential(envelope) }
    }
    if (formatResult?.ok && formatResult.bytes.byteLength > 0) {
      const { detectedType: dt, result } = autoDetectAndDecode(formatResult.bytes)
      return { detectedType: dt, decodeResult: result }
    }
    if (formatResult && !formatResult.ok) return { detectedType: null, decodeResult: { ok: false, error: formatResult.error } }
    return { detectedType: null, decodeResult: null }
  }, [rawInput, formatResult])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">

        <HeroIntro />
        <div role="tablist" aria-label="Inspection tools" className="mb-5 flex w-fit gap-1 rounded-xl border border-border bg-card p-1">
          {tools.map((tool, index) => (
            <button
              key={tool.id}
              id={`inspect-tab-${tool.id}`}
              role="tab"
              aria-selected={activeTool === tool.id}
              aria-controls={`inspect-panel-${tool.id}`}
              tabIndex={activeTool === tool.id ? 0 : -1}
              onClick={() => setActiveTool(tool.id)}
              onKeyDown={event => {
                const next = event.key === "ArrowRight" ? (index + 1) % tools.length
                  : event.key === "ArrowLeft" ? (index + tools.length - 1) % tools.length
                  : event.key === "Home" ? 0 : event.key === "End" ? tools.length - 1 : -1
                if (next < 0) return
                event.preventDefault()
                setActiveTool(tools[next].id)
                document.getElementById(`inspect-tab-${tools[next].id}`)?.focus()
              }}
              className={cn("min-h-11 rounded-lg px-4 py-2 text-sm font-medium transition-colors", activeTool === tool.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}
            >{tool.label}</button>
          ))}
        </div>
        <div id="inspect-panel-webauthn" role="tabpanel" aria-labelledby="inspect-tab-webauthn" hidden={activeTool !== "webauthn"}>
          <div className="grid items-start gap-4 xl:grid-cols-2">
            <PayloadInput incomingInput={incoming}
              onFormatResult={setFormatResult}
              onRawInput={setRawInput}
            />
            <OutputArea
              decodeResult={decodeResult}
              detectedType={detectedType}
            />
          </div>
        </div>
        <div id="inspect-panel-base64url" role="tabpanel" aria-labelledby="inspect-tab-base64url" hidden={activeTool !== "base64url"}>
          <Base64Converter />
        </div>
      </main>
    </div>
  )
}

export default App
