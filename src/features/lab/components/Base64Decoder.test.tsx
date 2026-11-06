import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import Base64Decoder from './Base64Decoder'
vi.mock('./ui/code-block', () => ({ CodeBlock: ({ value }: { value: string }) => <pre data-testid="output">{value}</pre> }))
afterEach(cleanup)
test('shows binary bytes as hex with their decoded size', () => {
  render(<Base64Decoder />)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '_w' } })
  fireEvent.click(screen.getByRole('button', { name: 'Decode base64url → text' }))
  expect(screen.getByTestId('output')).toHaveTextContent('ff')
  expect(screen.getByText('1 decoded byte')).toBeInTheDocument()
})
test('formats decoded JSON and reports source byte length', () => {
  render(<Base64Decoder />)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'eyJhIjoxfQ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Decode base64url → text' }))
  expect(screen.getByTestId('output').textContent).toBe('{\n  "a": 1\n}')
  expect(screen.getByText('7 decoded bytes')).toBeInTheDocument()
})
