import { parseAuthData } from "@/inspector/lib/decode-authdata";
import { decode } from "cbor-x/decode";
import type { PayloadType, DecodeResult } from "@/inspector/lib/types";
import { decodePayload } from "@/inspector/lib/decode-orchestrator";

export interface AutoDecodeResult {
  detectedType: PayloadType;
  result: DecodeResult;
}

/**
 * Inspect bytes for structural markers to identify payload type, then decode.
 *
 * Detection order:
 *  1. UTF-8 JSON with a `type` field → clientDataJSON
 *  2. CBOR object with fmt+authData+attStmt keys → registration (attestationObject)
 *  3. CBOR object with authenticatorData or signature+clientDataJSON keys → authentication
 *  4. Fallback → raw-cbor
 */
export function autoDetectAndDecode(bytes: ArrayBuffer | Uint8Array): AutoDecodeResult {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

  // 1. Try UTF-8 JSON — clientDataJSON is a JSON object with a `type` field
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(u8);
    const parsed = JSON.parse(text);
    if (typeof parsed === "object" && parsed !== null && typeof (parsed as Record<string, unknown>).type === "string") {
      return { detectedType: "clientDataJSON", result: decodePayload("clientDataJSON", bytes) };
    }
    return { detectedType: "clientDataJSON", result: { ok: false, error: "JSON não reconhecido. Informe clientDataJSON com type, origin e challenge, ou um PublicKeyCredential com rawId e response válidos." } };
  } catch {
    // not UTF-8 JSON
  }

  // 2. Probe CBOR structure without full validation
  try {
    const decoded = decode(u8);
    if (decoded && typeof decoded === "object" && !Array.isArray(decoded)) {
      const keys = Object.keys(decoded as Record<string, unknown>);
      if (keys.includes("fmt") && keys.includes("authData") && keys.includes("attStmt")) {
        return { detectedType: "registration", result: decodePayload("registration", bytes) };
      }
      if (keys.includes("authenticatorData") || (keys.includes("signature") && keys.includes("clientDataJSON"))) {
        return { detectedType: "authentication", result: decodePayload("authentication", bytes) };
      }
    }
  } catch {
    // not valid CBOR
  }

  if (u8.length >= 37) {
    const auth = parseAuthData(u8);
    if (auth.ok) return { detectedType: "authenticatorData", result: { ok: true, type: "authenticatorData", data: auth.data } };
  }

  // 3. Fallback
  return { detectedType: "raw-cbor", result: decodePayload("raw-cbor", bytes) };
}

export function payloadTypeLabel(type: PayloadType | "publicKeyCredential"): string {
  switch (type) {
    case "registration": return "Registro (attestationObject)";
    case "authentication": return "Autenticação (assertion)";
    case "clientDataJSON": return "clientDataJSON";
    case "authenticatorData": return "authenticatorData";
    case "raw-cbor": return "CBOR bruto";
    case "publicKeyCredential": return "PublicKeyCredential";
  }
}
