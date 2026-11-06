import { base64url } from './crypto'

export const isWebAuthnSupported = (): boolean => typeof window !== 'undefined' && !!window.PublicKeyCredential

function validateRpId(rpId: unknown) {
  if (rpId === undefined) return
  const host = window.location.hostname
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(String(rpId))) throw new Error('The browser does not accept a numeric RP ID. Use localhost for development or the RP domain.')
  if (typeof rpId !== 'string' || (rpId !== host && !host.endsWith(`.${rpId}`))) {
    throw new Error(`The RP ID must be ${host} or a valid parent domain. Open the Lab on the RP origin to use hardware.`)
  }
}

function descriptors(value: unknown) {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw new Error('allowCredentials/excludeCredentials must be an array.')
  return value.map(item => ({ ...item, id: base64url.decode(item.id) }))
}

export const createCredential = async (config: Record<string, unknown>) => {
  if (!isWebAuthnSupported()) throw new Error('WebAuthn is not available in this browser.')
  const rp = { name: 'Passkey Studio', ...(config.rp as object) } as PublicKeyCredentialRpEntity
  validateRpId(rp.id)
  const user = { name: 'test@example.com', displayName: 'Test user', ...(config.user as object) } as { id: string; name: string; displayName: string }
  const json = { timeout: 60000, pubKeyCredParams: [{ type: "public-key", alg: -7 }], ...config, rp, user }
  const options = typeof PublicKeyCredential.parseCreationOptionsFromJSON === "function" ? PublicKeyCredential.parseCreationOptionsFromJSON(json as PublicKeyCredentialCreationOptionsJSON) : {
    timeout: 60000,
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    ...config,
    rp,
    user: { ...user, id: base64url.decode(user.id) },
    challenge: base64url.decode(config.challenge as string),
    ...(config.excludeCredentials !== undefined ? { excludeCredentials: descriptors(config.excludeCredentials) } : {}),
  } as PublicKeyCredentialCreationOptions
  const credential = await navigator.credentials.create({ publicKey: options }) as PublicKeyCredential | null
  if (!credential) throw new Error('The authenticator did not return a credential. Try again.')
  const response = credential.response as AuthenticatorAttestationResponse
  return {
    id: credential.id,
    rawId: base64url.encode(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      clientDataJSON: base64url.encode(response.clientDataJSON),
      attestationObject: base64url.encode(response.attestationObject),
      transports: response.getTransports?.(),
      publicKeyAlgorithm: response.getPublicKeyAlgorithm?.(),
    },
  }
}

export const getAssertion = async (config: Record<string, unknown>) => {
  if (!isWebAuthnSupported()) throw new Error('WebAuthn is not available in this browser.')
  validateRpId(config.rpId)
  const options = typeof PublicKeyCredential.parseRequestOptionsFromJSON === "function" ? PublicKeyCredential.parseRequestOptionsFromJSON({ ...config, challenge: config.challenge as string } as PublicKeyCredentialRequestOptionsJSON) : {
    timeout: 60000,
    ...config,
    challenge: base64url.decode(config.challenge as string),
    ...(config.allowCredentials !== undefined ? { allowCredentials: descriptors(config.allowCredentials) } : {}),
  } as PublicKeyCredentialRequestOptions
  const credential = await navigator.credentials.get({ publicKey: options }) as PublicKeyCredential | null
  if (!credential) throw new Error('The authenticator did not return a response. Try again.')
  const response = credential.response as AuthenticatorAssertionResponse
  return {
    id: credential.id,
    rawId: base64url.encode(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      clientDataJSON: base64url.encode(response.clientDataJSON),
      authenticatorData: base64url.encode(response.authenticatorData),
      signature: base64url.encode(response.signature),
      userHandle: response.userHandle ? base64url.encode(response.userHandle) : null,
    },
  }
}

export const parseAlgorithm = (alg: number): string => alg === -7 ? 'ES256' : alg === -257 ? 'RS256' : 'Unknown'
