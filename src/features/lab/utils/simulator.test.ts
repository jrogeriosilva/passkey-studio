/// <reference types="node" />
import { createHash, createPublicKey, verify, webcrypto } from 'node:crypto'
import { afterEach, expect, test, vi } from 'vitest'
import { createSimulatedCredential, createSimulatedAssertion } from './fido2Simulator'
import { base64url } from './crypto'
import { getCredentialById, importData, publicCredential, saveCredential, updateSignCount } from './localStorage'
import { parseAuthData } from '../../inspector/lib/decode-authdata'
afterEach(() => { localStorage.clear(); vi.unstubAllGlobals() })
test('a newly generated software credential can sign twice with persisted increasing counters', async () => {
  vi.stubGlobal('crypto', webcrypto)
  const generated = await createSimulatedCredential({challenge:'AQI',rpId:'example.com'})
  const credential = { ...generated, type:'simulated' as const, credentialId:generated.rawId, signCount:0 }
  expect(saveCredential(credential)).toBe(true)
  for (const count of [1,2]) {
    const current = getCredentialById(credential.id)!
    const assertion = await createSimulatedAssertion({challenge:'AQI',credential:current,rpId:current.rpId,signCount:(current.signCount ?? 0)+1})
    const auth = parseAuthData(base64url.decode(assertion.response.authenticatorData))
    expect(auth).toMatchObject({ok:true,data:{signCount:count}})
    expect(updateSignCount(current.id, count)).toBe(true)
  }
  expect(getCredentialById(credential.id)?.signCount).toBe(2)
  expect(publicCredential(credential)).not.toHaveProperty('privateKeyJWK')
  expect(publicCredential({publicKey:{kty:'EC'},privateKey:{d:'synthetic-private'}})).not.toHaveProperty('privateKey')
})
test('rejects malformed imports without replacing existing records', () => {
  localStorage.setItem('fido2_credentials','[]')
  expect(importData({ credentials: [{}] } as never)).toBe(false)
  expect(localStorage.getItem('fido2_credentials')).toBe('[]')
})

test.each(['ES256', 'RS256'])('%s assertions verify independently and preserve the registration user handle', async algorithm => {
  vi.stubGlobal('crypto', webcrypto)
  const generated = await createSimulatedCredential({ challenge: 'AQI', algorithm, rpId: 'example.com', userId: 'AAEC_w' })
  const credential = { ...generated, type: 'simulated' as const, credentialId: generated.rawId }
  const assertion = await createSimulatedAssertion({ challenge: 'AwQ', credential, rpId: credential.rpId })
  const clientData = Buffer.from(assertion.response.clientDataJSON, 'base64url')
  const signed = Buffer.concat([
    Buffer.from(assertion.response.authenticatorData, 'base64url'),
    createHash('sha256').update(clientData).digest(),
  ])
  const publicKey = createPublicKey({ key: { ...generated.publicKeyJWK }, format: 'jwk' })
  expect(verify('sha256', signed, publicKey, Buffer.from(assertion.response.signature, 'base64url'))).toBe(true)
  expect(assertion.response.userHandle).toBe('AAEC_w')
  expect([...new Uint8Array(base64url.decode(assertion.response.userHandle))]).toEqual([0, 1, 2, 255])
  expect(JSON.parse(clientData.toString()).challenge).toBe('AwQ')
})

test('simulation enforces RP and allow/exclude restrictions while permitting discoverable authentication', async () => {
  vi.stubGlobal('crypto', webcrypto)
  const generated = await createSimulatedCredential({ challenge: 'AQI', rpId: 'example.com' })
  const credential = { ...generated, type: 'simulated' as const, credentialId: generated.rawId }
  saveCredential(credential)
  await expect(createSimulatedAssertion({ challenge: 'AQI', credential, rpId: 'foreign.example' })).rejects.toThrow(/RP ID/)
  await expect(createSimulatedAssertion({ challenge: 'AQI', credential, rpId: credential.rpId, allowCredentials: [{ id: 'AQI', type: 'public-key' }] })).rejects.toThrow(/allowCredentials/)
  await expect(createSimulatedAssertion({ challenge: 'AQI', credential, rpId: credential.rpId, allowCredentials: [] })).resolves.toMatchObject({ id: credential.id })
  const descriptor = { id: credential.id, type: 'public-key' }
  await expect(createSimulatedAssertion({ challenge: 'AQI', credential, rpId: credential.rpId, allowCredentials: [descriptor] })).resolves.toMatchObject({ id: credential.id })
  await expect(createSimulatedCredential({ challenge: 'AQI', rpId: credential.rpId, excludeCredentials: [descriptor] })).rejects.toMatchObject({ name: 'InvalidStateError' })
  await expect(createSimulatedCredential({ challenge: 'AQI', rpId: 'different.example', excludeCredentials: [descriptor] })).resolves.toHaveProperty('id')
})

test('registration and assertions reject malformed challenges and invalid user handles', async () => {
  vi.stubGlobal('crypto', webcrypto)
  const generated = await createSimulatedCredential({ challenge: new Uint8Array([1, 2]).buffer })
  const credential = { ...generated, type: 'simulated' as const, credentialId: generated.rawId }
  for (const challenge of ['', '%%%', 'AQI=', 'AR', 42]) {
    await expect(createSimulatedCredential({ challenge: challenge as string })).rejects.toThrow(/challenge|base64url/)
    await expect(createSimulatedAssertion({ challenge: challenge as string, credential })).rejects.toThrow(/challenge|base64url/)
  }
  for (const userId of ['', '%%%', base64url.encode(new Uint8Array(65))]) {
    await expect(createSimulatedCredential({ challenge: 'AQI', userId })).rejects.toThrow(/base64url|user.id/)
  }
  await expect(createSimulatedCredential({ challenge: 'AQI', userId: base64url.encode(new Uint8Array(64)) })).resolves.toHaveProperty('id')
})
