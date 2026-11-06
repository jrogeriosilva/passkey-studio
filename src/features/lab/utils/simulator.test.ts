/// <reference types="node" />
import { webcrypto } from 'node:crypto'
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
