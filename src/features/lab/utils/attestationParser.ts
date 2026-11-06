import { decodeAttestationObject } from '@/inspector/lib/decode-attestation'
import { bytesToDisplayHex } from '@/inspector/lib/tree-preprocess'
import { base64url } from './crypto'

/** Reuse the same bounds-checked binary parser as Inspecionar. */
export function parseAttestationObject(input: string) {
  const result = decodeAttestationObject(base64url.decode(input))
  if (!result.ok) throw new Error(result.error)
  const { fmt, attStmt, authData, rawAuthData } = result.data
  const attested = authData.attestedCredentialData
  return {
    fmt,
    attStmt,
    authData: {
      rpIdHash: bytesToDisplayHex(authData.rpIdHash),
      flagsByte: `0x${authData.flags.rawByte.toString(16).padStart(2, '0')}`,
      flags: { UP: authData.flags.up, UV: authData.flags.uv, BE: !!authData.flags.be, BS: !!authData.flags.bs, AT: authData.flags.at, ED: authData.flags.ed },
      signCount: authData.signCount,
      ...(attested ? { attestedCredentialData: {
        aaguid: bytesToDisplayHex(attested.aaguid),
        credentialIdLength: attested.credentialIdLength,
        credentialId: bytesToDisplayHex(attested.credentialId),
        credentialIdBase64url: base64url.encode(attested.credentialId),
        credentialPublicKey: {
          ...attested.coseKey,
          rawEntries: Object.fromEntries(Object.entries(attested.coseKey.rawEntries).map(([label, value]) => {
            const names: Record<string, string> = { '1': 'kty', '3': 'alg', '-1': attested.coseKey.kty.raw === 3 ? 'n' : 'crv', '-2': attested.coseKey.kty.raw === 3 ? 'e' : 'x', '-3': 'y' }
            return [names[label] ? `${label} (${names[label]})` : label, value]
          })),
        },
      } } : {}),
      extensions: authData.extensions,
    },
    rawAuthData: bytesToDisplayHex(rawAuthData),
    raw: { fmt, attStmt, authData: rawAuthData },
  }
}
