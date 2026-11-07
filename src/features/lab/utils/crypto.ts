export const base64url = {
  encode: (buffer: ArrayBuffer | Uint8Array): string => {
    const arr = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    const base64 = btoa(String.fromCharCode(...arr))
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  },

  decode: (str: string): ArrayBuffer => {
    if (typeof str !== 'string' || !str || !/^[A-Za-z0-9_-]+$/.test(str) || str.length % 4 === 1) throw new Error('Invalid base64url. Enter the full value without quotes, spaces or padding.')
    let s = str.replace(/-/g, '+').replace(/_/g, '/')
    while (s.length % 4) s += '='
    const binary = atob(s)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    if (base64url.encode(bytes) !== str) throw new Error('Invalid base64url. Use the canonical value without padding.')
    return bytes.buffer as ArrayBuffer
  },
}

export const decodeCredentialDescriptors = (value: unknown): Array<PublicKeyCredentialDescriptor & { id: ArrayBuffer }> | undefined => {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw new Error('allowCredentials/excludeCredentials must be an array.')
  return value.map(item => {
    if (!item || typeof item !== 'object' || item.type !== 'public-key') throw new Error('Each credential descriptor must have type "public-key" and a base64url id.')
    return { ...item, id: base64url.decode(item.id) }
  })
}

export const generateCredentialId = (): string => {
  const buffer = new Uint8Array(16)
  crypto.getRandomValues(buffer)
  return base64url.encode(buffer)
}

export const generateRS256KeyPair = async (): Promise<CryptoKeyPair> => {
  return await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify']
  ) as CryptoKeyPair
}

export const generateES256KeyPair = async (): Promise<CryptoKeyPair> => {
  return await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  ) as CryptoKeyPair
}

export const exportKey = async (key: CryptoKey): Promise<JsonWebKey> => {
  return await crypto.subtle.exportKey('jwk', key)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const subtleImportKey = crypto.subtle.importKey.bind(crypto.subtle) as any

export const importKey = async (
  jwk: JsonWebKey,
  algorithm: string,
  keyType: 'public' | 'private'
): Promise<CryptoKey> => {
  const keyUsages: KeyUsage[] = keyType === 'private' ? ['sign'] : ['verify']

  if (algorithm === 'RS256') {
    return await subtleImportKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, keyUsages)
  } else if (algorithm === 'ES256') {
    return await subtleImportKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, true, keyUsages)
  }
  throw new Error(`Unsupported algorithm: ${algorithm}`)
}

export const signData = async (
  privateKey: CryptoKey,
  data: ArrayBuffer | Uint8Array,
  algorithm: string
): Promise<ArrayBuffer> => {
  const buf = data instanceof Uint8Array ? new Uint8Array(data).buffer : data
  if (algorithm === 'RS256') {
    return await crypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5' }, privateKey, buf)
  } else if (algorithm === 'ES256') {
    const raw = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, buf))
    // WebCrypto returns fixed-width r || s; WebAuthn assertions require DER integers.
    const integer = (bytes: Uint8Array) => {
      let start = 0
      while (start < bytes.length - 1 && bytes[start] === 0) start++
      const magnitude = bytes.slice(start)
      const padding = magnitude[0] & 0x80 ? [0] : []
      return [0x02, magnitude.length + padding.length, ...padding, ...magnitude]
    }
    const values = [...integer(raw.slice(0, 32)), ...integer(raw.slice(32))]
    return new Uint8Array([0x30, values.length, ...values]).buffer
  }
  throw new Error(`Unsupported algorithm: ${algorithm}`)
}

export const jwkToCOSE = (jwk: JsonWebKey, algorithm: string): Map<number, unknown> => {
  const coseKey = new Map<number, unknown>()

  if (algorithm === 'RS256') {
    const n = new Uint8Array(base64url.decode(jwk.n!))
    const e = new Uint8Array(base64url.decode(jwk.e!))
    coseKey.set(1, 3); coseKey.set(3, -257); coseKey.set(-1, n); coseKey.set(-2, e)
    return coseKey
  } else if (algorithm === 'ES256') {
    const x = new Uint8Array(base64url.decode(jwk.x!))
    const y = new Uint8Array(base64url.decode(jwk.y!))
    coseKey.set(1, 2); coseKey.set(3, -7); coseKey.set(-1, 1); coseKey.set(-2, x); coseKey.set(-3, y)
    return coseKey
  }
  throw new Error(`Unsupported algorithm: ${algorithm}`)
}
