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

function App({ incomingInput }: { incomingInput?: { value: string; key: number } }) {
  const [incoming, setIncoming] = useState(incomingInput)
  const loadedSource = useRef<string | number | undefined>(undefined)
  useEffect(() => {
    const load = () => {
      const sampleId = new URLSearchParams(window.location.search).get("sample")
      const sample = getSamplePayloads().find(item => item.id === sampleId)
      const source = sample ? `sample:${sample.id}` : incomingInput?.key
      if (loadedSource.current === source) return
      loadedSource.current = source
      if (sample) setIncoming({ value: sample.raw, key: Date.now() })
      else if (incomingInput) setIncoming(incomingInput)
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
      </main>
    </div>
  )
}

export default App
