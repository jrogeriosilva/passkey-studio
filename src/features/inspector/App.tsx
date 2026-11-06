import { useState, useMemo } from "react"
import { HeroIntro } from "@/inspector/components/HeroIntro"
import { PayloadInput } from "@/inspector/components/PayloadInput"
import { OutputArea } from "@/inspector/components/OutputArea"
import { EducationalContent } from "@/inspector/components/EducationalContent"
import { decodeFullCredential } from "@/inspector/lib/decode-orchestrator"
import { autoDetectAndDecode } from "@/inspector/lib/payload-type-detection"
import { tryExtractPublicKeyCredential } from "@/inspector/lib/publickeycredential-input"
import type { PayloadType, DecodeResult } from "@/inspector/lib/types"
type DetectedType = PayloadType | "publicKeyCredential"
import type { FormatResult } from "@/inspector/lib/format-detection"

function App() {
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
    return { detectedType: null, decodeResult: null }
  }, [rawInput, formatResult])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
        <div className="pt-6"></div>
        <HeroIntro />
        <div className="flex flex-col gap-4">
          <PayloadInput
            onFormatResult={setFormatResult}
            onRawInput={setRawInput}
          />
          <OutputArea
            decodeResult={decodeResult}
            detectedType={detectedType}
          />
        </div>
        <EducationalContent />
      </main>
    </div>
  )
}

export default App
