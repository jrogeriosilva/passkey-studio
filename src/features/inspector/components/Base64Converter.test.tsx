import { afterEach, expect, test } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import Base64Converter from './Base64Converter'
afterEach(cleanup)
test('shows binary bytes as hex with their decoded size', () => {
  render(<Base64Converter />)
  fireEvent.change(screen.getByRole('textbox', { name: 'Input' }), { target: { value: '_w' } })
  fireEvent.click(screen.getByRole('button', { name: 'Decode base64url → text' }))
  expect(screen.getByRole('textbox', { name: 'Output · hex' })).toHaveValue('ff')
  expect(screen.getByText('1 decoded byte')).toBeInTheDocument()
})
test('formats decoded JSON and reports source byte length', () => {
  render(<Base64Converter />)
  fireEvent.change(screen.getByRole('textbox', { name: 'Input' }), { target: { value: 'eyJhIjoxfQ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Decode base64url → text' }))
  expect(screen.getByRole('textbox', { name: 'Output' })).toHaveValue('{\n  "a": 1\n}')
  expect(screen.getByText('7 decoded bytes')).toBeInTheDocument()
})

test('encodes UTF-8 without removing whitespace and swaps the result back for decoding', () => {
  render(<Base64Converter />)
  const input = screen.getByRole('textbox', { name: 'Input' })
  fireEvent.change(input, { target: { value: ' Olá \n' } })
  fireEvent.click(screen.getByRole('button', { name: 'Encode text → base64url' }))
  expect(screen.getByRole('textbox', { name: 'Output' })).toHaveValue('IE9sw6EgCg')
  fireEvent.click(screen.getByRole('button', { name: 'Swap' }))
  expect(input).toHaveValue('IE9sw6EgCg')
  fireEvent.click(screen.getByRole('button', { name: 'Decode base64url → text' }))
  expect(screen.getByRole('textbox', { name: 'Output' })).toHaveValue(' Olá \n')
})

test('clears stale output on edits and reports invalid input without retaining a previous result', () => {
  render(<Base64Converter />)
  const input = screen.getByRole('textbox', { name: 'Input' })
  fireEvent.change(input, { target: { value: 'aGk' } })
  fireEvent.click(screen.getByRole('button', { name: 'Decode base64url → text' }))
  expect(screen.getByRole('textbox', { name: 'Output' })).toHaveValue('hi')
  fireEvent.change(input, { target: { value: '%%%' } })
  expect(screen.getByRole('textbox', { name: 'Output' })).toHaveValue('')
  fireEvent.click(screen.getByRole('button', { name: 'Decode base64url → text' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid base64url')
  expect(input).toHaveAttribute('aria-invalid', 'true')
  fireEvent.change(input, { target: { value: 'A' } })
  fireEvent.click(screen.getByRole('button', { name: 'Decode base64url → text' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid base64url')
})
