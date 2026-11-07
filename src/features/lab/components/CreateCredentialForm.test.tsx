import { webcrypto } from 'node:crypto'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import CreateCredentialForm from './CreateCredentialForm'
import { createCredential } from '../utils/fido2Hardware'
import { getCredentials } from '../utils/localStorage'

vi.mock('../utils/fido2Hardware', () => ({ createCredential: vi.fn(), parseAlgorithm: (alg: number) => alg === -257 ? 'RS256' : 'ES256' }))
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); vi.clearAllMocks() })

test.each(['ES256', 'RS256'])('registration generates fresh %s keys using the selected algorithm', async algorithm => {
  vi.stubGlobal('crypto', webcrypto)
  const onCreated = vi.fn()
  render(<CreateCredentialForm mode="simulated" onCredentialCreated={onCreated} />)
  const selector = screen.getByRole('combobox', { name: 'Credential algorithm' })
  expect(selector).toHaveValue('ES256')
  fireEvent.change(selector, { target: { value: algorithm } })
  expect(screen.queryByText(/pre-generated key|Generate a test key/)).not.toBeInTheDocument()

  for (const count of [1, 2]) {
    fireEvent.click(screen.getByRole('button', { name: 'Create simulated credential' }))
    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(count))
    expect(selector).toHaveValue(algorithm)
  }
  const credentials = getCredentials()
  expect(credentials).toHaveLength(2)
  for (const credential of credentials) {
    expect(credential.algorithm).toBe(algorithm)
    expect(credential.publicKeyJWK?.kty).toBe(algorithm === 'RS256' ? 'RSA' : 'EC')
    expect(credential.privateKeyJWK?.d).toBeTruthy()
  }
  expect(credentials[0].credentialId).not.toBe(credentials[1].credentialId)
  expect(credentials[0].publicKeyJWK).not.toEqual(credentials[1].publicKeyJWK)
})

test.each([
  ['ES256', [{ type: 'public-key', alg: -257 }]],
  ['RS256', [{ type: 'public-key', alg: -7 }]],
  ['ES256', [{ type: 'public-key', alg: -8 }]],
  ['ES256', []],
  ['ES256', null],
  ['ES256', [{ type: 'invalid', alg: -7 }]],
])('rejects %s when creation options do not allow it (%j)', async (algorithm, params) => {
  render(<CreateCredentialForm mode="simulated" />)
  fireEvent.change(screen.getByRole('combobox', { name: 'Credential algorithm' }), { target: { value: algorithm } })
  const editor = screen.getByRole('textbox', { name: 'Credential creation options (JSON)' })
  const config = JSON.parse((editor as HTMLTextAreaElement).value)
  config.pubKeyCredParams = params
  fireEvent.change(editor, { target: { value: JSON.stringify(config) } })
  fireEvent.click(screen.getByRole('button', { name: 'Create simulated credential' }))
  expect(await screen.findByText(`${algorithm} is not allowed by pubKeyCredParams. Select an allowed algorithm or adjust the creation options.`)).toBeInTheDocument()
  expect(getCredentials()).toHaveLength(0)
})

test('WebAuthn delegates algorithm selection and creation options to the authenticator', async () => {
  vi.mocked(createCredential).mockResolvedValue({ id: 'AQI', rawId: 'AQI', type: 'public-key', authenticatorAttachment: null, clientExtensionResults: {}, response: { attestationObject: 'AQI', clientDataJSON: 'AQI', publicKeyAlgorithm: -257, transports: [] } })
  render(<CreateCredentialForm mode="hardware" />)
  expect(screen.queryByRole('combobox', { name: 'Credential algorithm' })).not.toBeInTheDocument()
  const editor = screen.getByRole('textbox', { name: 'Credential creation options (JSON)' })
  const config = JSON.parse((editor as HTMLTextAreaElement).value)
  config.pubKeyCredParams = [{ type: 'public-key', alg: -8 }]
  fireEvent.change(editor, { target: { value: JSON.stringify(config) } })
  fireEvent.click(screen.getByRole('button', { name: 'Create WebAuthn credential' }))
  await waitFor(() => expect(getCredentials()).toHaveLength(1))
  expect(createCredential).toHaveBeenCalledWith(config)
  expect(getCredentials()[0].algorithm).toBe('RS256')
})
