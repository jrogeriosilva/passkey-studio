import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import AssertionDisplay from './AssertionDisplay'
import { openInspector } from '../../../inspection'

vi.mock('../../../inspection', () => ({ openInspector: vi.fn() }))
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks() })

test('copy and inspection preserve authenticator attachment and extension results', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('navigator', { clipboard: { writeText } })
  const assertion = { id: 'AQI', rawId: 'AQI', authenticatorAttachment: 'platform', clientExtensionResults: { appid: true, prf: { results: { first: 'AwQ' } } }, response: { clientDataJSON: 'AQI', authenticatorData: 'AQI', signature: 'AQI', userHandle: null } }
  render(<AssertionDisplay assertion={assertion} />)
  expect(screen.getByText('"clientExtensionResults"')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Copy all' }))
  await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
  const expected = { ...assertion, type: 'public-key' }
  expect(JSON.parse(writeText.mock.calls[0][0])).toEqual(expected)
  fireEvent.click(screen.getByRole('button', { name: 'Inspect this payload' }))
  expect(openInspector).toHaveBeenCalledWith(expected)
})
