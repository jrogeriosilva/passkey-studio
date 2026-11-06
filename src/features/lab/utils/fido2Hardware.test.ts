import { afterEach, expect, test, vi } from 'vitest'
import { createCredential, getAssertion } from './fido2Hardware'
const bytes = new Uint8Array([1, 2]).buffer
const credential = { id: 'AQI', rawId: bytes, type: 'public-key', getClientExtensionResults: () => ({ credProps: { rk: true } }), response: { clientDataJSON: bytes, attestationObject: bytes, authenticatorData: bytes, signature: bytes, userHandle: null, getTransports: () => ['usb'] } }
afterEach(() => vi.unstubAllGlobals())
function api() {
  const create = vi.fn().mockResolvedValue(credential), get = vi.fn().mockResolvedValue(credential)
  vi.stubGlobal('PublicKeyCredential', {})
  vi.stubGlobal('navigator', { credentials: { create, get } })
  return { create, get }
}
test('passes creation settings, binary IDs and extension options without replacing edited values', async () => {
  const { create } = api()
  const config = { challenge: 'AQI', rp: { id: window.location.hostname, name: 'Synthetic RP' }, user: { id: 'AQI', name: 'synthetic', displayName: 'Synthetic' }, pubKeyCredParams: [{ type: 'public-key', alg: -257 }], timeout: 12345, attestation: 'none', authenticatorSelection: { residentKey: 'required', userVerification: 'required', authenticatorAttachment: 'cross-platform' }, excludeCredentials: [{ type: 'public-key', id: 'AQI', transports: ['usb'] }], extensions: { credProps: true } }
  await createCredential(config)
  const options = create.mock.calls[0][0].publicKey
  expect(options).toMatchObject({ ...config, challenge: expect.any(ArrayBuffer), user: { ...config.user, id: expect.any(ArrayBuffer) }, excludeCredentials: [{ type: 'public-key', id: expect.any(ArrayBuffer), transports: ['usb'] }] })
  expect([...new Uint8Array(options.user.id)]).toEqual([1,2])
})
test('preserves request policy, allowCredentials and transports and supports discoverable credentials', async () => {
  const { get } = api()
  const config = { challenge: 'AQI', rpId: window.location.hostname, timeout: 7777, userVerification: 'required', allowCredentials: [{ type: 'public-key', id: 'AQI', transports: ['usb'] }] }
  await getAssertion(config)
  expect(get.mock.calls[0][0].publicKey).toMatchObject({ ...config, challenge: expect.any(ArrayBuffer), allowCredentials: [{ type:'public-key', id: expect.any(ArrayBuffer), transports:['usb'] }] })
  await getAssertion({ challenge: 'AQI' })
  expect(get.mock.calls[1][0].publicKey).not.toHaveProperty('allowCredentials')
})
test('rejects a foreign RP ID before invoking an authenticator', async () => {
  const { create } = api()
  await expect(createCredential({challenge:'AQI',rp:{id:'example.invalid'},user:{id:'AQI'}})).rejects.toThrow(/RP ID/)
  expect(create).not.toHaveBeenCalled()
})
