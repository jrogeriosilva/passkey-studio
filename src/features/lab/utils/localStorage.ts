export interface StoredCredential {
  id: string
  type: 'simulated' | 'hardware'
  algorithm: string
  credentialId: string
  publicKeyJWK?: JsonWebKey
  privateKeyJWK?: JsonWebKey
  response?: Record<string, unknown>
  rpId: string
  rpName?: string
  userId: string
  userName?: string
  userDisplayName?: string
  signCount?: number
  createdAt: string
}

export interface GeneratedKey {
  id: string
  algorithm: string
  publicKey: JsonWebKey
  privateKey: JsonWebKey
  createdAt: string
  used: boolean
}

const STORAGE_KEYS = {
  CREDENTIALS: 'fido2_credentials',
  GENERATED_KEYS: 'fido2_generated_keys',
}

export const getCredentials = (): StoredCredential[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CREDENTIALS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export const saveCredential = (credential: StoredCredential): boolean => {
  try {
    const credentials = getCredentials()
    credentials.push(credential)
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials))
    return true
  } catch {
    return false
  }
}

export const getCredentialById = (id: string): StoredCredential | null => {
  return getCredentials().find(c => c.id === id) || null
}

export const deleteCredential = (id: string): boolean => {
  try {
    const filtered = getCredentials().filter(c => c.id !== id)
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(filtered))
    return true
  } catch {
    return false
  }
}

export const clearAllCredentials = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CREDENTIALS)
    return true
  } catch {
    return false
  }
}

export const getGeneratedKeys = (): GeneratedKey[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GENERATED_KEYS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export const saveGeneratedKey = (keyPair: GeneratedKey): boolean => {
  try {
    const keys = getGeneratedKeys()
    keys.push(keyPair)
    localStorage.setItem(STORAGE_KEYS.GENERATED_KEYS, JSON.stringify(keys))
    return true
  } catch {
    return false
  }
}

export const getGeneratedKeyById = (id: string): GeneratedKey | null => {
  return getGeneratedKeys().find(k => k.id === id) || null
}

export const markKeyAsUsed = (id: string): boolean => {
  try {
    const keys = getGeneratedKeys()
    const key = keys.find(k => k.id === id)
    if (key) {
      key.used = true
      localStorage.setItem(STORAGE_KEYS.GENERATED_KEYS, JSON.stringify(keys))
      return true
    }
    return false
  } catch {
    return false
  }
}

export const deleteGeneratedKey = (id: string): boolean => {
  try {
    const filtered = getGeneratedKeys().filter(k => k.id !== id)
    localStorage.setItem(STORAGE_KEYS.GENERATED_KEYS, JSON.stringify(filtered))
    return true
  } catch {
    return false
  }
}

export const clearAllGeneratedKeys = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GENERATED_KEYS)
    return true
  } catch {
    return false
  }
}

export const exportAllData = () => ({
  credentials: getCredentials(),
  generatedKeys: getGeneratedKeys(),
  exportedAt: new Date().toISOString(),
})

export const importData = (data: { credentials?: StoredCredential[]; generatedKeys?: GeneratedKey[] }): boolean => {
  try {
    if (!data || typeof data !== 'object') return false
    if (data.credentials !== undefined && (!Array.isArray(data.credentials) || !data.credentials.every(c => c && typeof c.id === 'string' && typeof c.credentialId === 'string' && typeof c.rpId === 'string' && typeof c.userId === 'string' && ['simulated', 'hardware'].includes(c.type)))) return false
    if (data.generatedKeys !== undefined && (!Array.isArray(data.generatedKeys) || !data.generatedKeys.every(k => k && typeof k.id === 'string' && typeof k.algorithm === 'string' && k.publicKey && k.privateKey && typeof k.used === 'boolean'))) return false
    if (!data.credentials && !data.generatedKeys) return false
    const oldCredentials = localStorage.getItem(STORAGE_KEYS.CREDENTIALS)
    const oldKeys = localStorage.getItem(STORAGE_KEYS.GENERATED_KEYS)
    try {
      if (data.credentials) localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(data.credentials))
      if (data.generatedKeys) localStorage.setItem(STORAGE_KEYS.GENERATED_KEYS, JSON.stringify(data.generatedKeys))
    } catch {
      // Best effort rollback: leave no deliberate half-import.
      if (oldCredentials === null) localStorage.removeItem(STORAGE_KEYS.CREDENTIALS)
      else localStorage.setItem(STORAGE_KEYS.CREDENTIALS, oldCredentials)
      if (oldKeys === null) localStorage.removeItem(STORAGE_KEYS.GENERATED_KEYS)
      else localStorage.setItem(STORAGE_KEYS.GENERATED_KEYS, oldKeys)
      return false
    }
    return true
  } catch {
    return false
  }
}

export function updateSignCount(id: string, count: number): boolean {
  try {
    const credentials = getCredentials()
    const credential = credentials.find(item => item.id === id)
    if (!credential) return false
    credential.signCount = count
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials))
    return true
  } catch { return false }
}

/** The default export omits private material, including JWK private parameters. */
export function publicCredential<T extends { privateKeyJWK?: JsonWebKey; privateKey?: JsonWebKey }>(value: T) {
  const { privateKeyJWK: _privateJwk, privateKey: _privateKey, ...publicData } = value
  void _privateJwk; void _privateKey
  return publicData
}
