import { afterEach, expect, test, vi } from 'vitest'
import { signData } from './crypto'

afterEach(() => vi.unstubAllGlobals())

test('ES256 DER encoding strips leading zeroes, pads signed integers and signs only the selected bytes', async () => {
  const raw = new Uint8Array(64)
  raw[1] = 0x80
  raw[63] = 1
  const sign = vi.fn().mockResolvedValue(raw.buffer)
  vi.stubGlobal('crypto', { subtle: { sign } })
  const result = new Uint8Array(await signData({} as CryptoKey, new Uint8Array([9, 1, 2, 9]).subarray(1, 3), 'ES256'))
  expect([...new Uint8Array(sign.mock.calls[0][2])]).toEqual([1, 2])
  expect([...result]).toEqual([0x30, 37, 0x02, 32, 0, 0x80, ...new Uint8Array(30), 0x02, 1, 1])
})
