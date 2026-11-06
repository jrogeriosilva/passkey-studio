import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import Inspector from './App'

afterEach(() => { cleanup(); window.history.replaceState(null, '', '/') })

test('defaults to WebAuthn and preserves converter and payload drafts when switching with the keyboard', () => {
  render(<Inspector />)
  const webauthn = screen.getByRole('tab', { name: 'WebAuthn' })
  const base64url = screen.getByRole('tab', { name: 'Base64url' })
  expect(webauthn).toHaveAttribute('aria-selected', 'true')
  fireEvent.change(screen.getByRole('textbox', { name: 'WebAuthn payload' }), { target: { value: 'eyJhIjoxfQ' } })
  webauthn.focus()
  fireEvent.keyDown(webauthn, { key: 'ArrowRight' })
  expect(base64url).toHaveFocus()
  expect(screen.queryByRole('textbox', { name: 'WebAuthn payload' })).not.toBeInTheDocument()
  fireEvent.change(screen.getByRole('textbox', { name: 'Input' }), { target: { value: 'synthetic draft' } })
  fireEvent.click(screen.getByRole('button', { name: 'Encode text → base64url' }))
  fireEvent.keyDown(base64url, { key: 'Home' })
  expect(webauthn).toHaveFocus()
  expect(screen.getByRole('textbox', { name: 'WebAuthn payload' })).toHaveValue('eyJhIjoxfQ')
  fireEvent.keyDown(webauthn, { key: 'End' })
  expect(screen.getByRole('textbox', { name: 'Input' })).toHaveValue('synthetic draft')
  expect(screen.getByRole('textbox', { name: 'Output' })).not.toHaveValue('')
})

test('opens incoming Lab payloads and sample links in WebAuthn while keeping the converter draft', () => {
  const { rerender } = render(<Inspector />)
  fireEvent.click(screen.getByRole('tab', { name: 'Base64url' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Input' }), { target: { value: 'converter draft' } })
  rerender(<Inspector incomingInput={{ value: 'eyJhIjoxfQ', key: 1 }} />)
  expect(screen.getByRole('tab', { name: 'WebAuthn' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('textbox', { name: 'WebAuthn payload' })).toHaveValue('eyJhIjoxfQ')
  fireEvent.click(screen.getByRole('tab', { name: 'Base64url' }))
  expect(screen.getByRole('textbox', { name: 'Input' })).toHaveValue('converter draft')
  window.history.replaceState(null, '', '/webauthn-decoder/?sample=clientdata-create')
  fireEvent(window, new Event('studio:location'))
  expect(screen.getByRole('tab', { name: 'WebAuthn' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('textbox', { name: 'WebAuthn payload' })).not.toHaveValue('eyJhIjoxfQ')
})
