import { useState, useMemo } from "react"
import { EcosystemNav } from "@/components/EcosystemNav"
import { AppHeader } from "@/components/AppHeader"
import { AppFooter } from "@/components/AppFooter"
import { HeroIntro } from "@/components/HeroIntro"
import { PayloadInput } from "@/components/PayloadInput"
import { OutputArea } from "@/components/OutputArea"
import { DemoCallToAction } from "@/components/DemoCallToAction"
import { EducationalContent } from "@/components/EducationalContent"
import { decodeFullCredential } from "@/lib/decode-orchestrator"
import { autoDetectAndDecode } from "@/lib/payload-type-detection"
import { tryExtractPublicKeyCredential } from "@/lib/publickeycredential-input"
import type { PayloadType, DecodeResult } from "@/lib/types"
type DetectedType = PayloadType | "publicKeyCredential"
import type { FormatResult } from "@/lib/format-detection"

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
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
        <div className="pt-6"><EcosystemNav /></div>
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
        <div className="mt-10">
          <DemoCallToAction />
        </div>
        <EducationalContent />
      </main>
      <AppFooter />
    </div>
  )
}

export default App
