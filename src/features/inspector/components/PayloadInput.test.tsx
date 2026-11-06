import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { PayloadInput } from "./PayloadInput"

vi.mock("./SamplePayloadsMenu", () => ({
  SamplePayloadsMenu: ({ onSelect }: { onSelect: (sample: { raw: string }) => void }) =>
    <button onClick={() => onSelect({ raw: "YQ" })}>Load test sample</button>,
}))

afterEach(() => { cleanup(); vi.useRealTimers() })

describe("PayloadInput pending detection", () => {
  it("keeps a loaded sample when an older keystroke finishes detecting", () => {
    vi.useFakeTimers()
    const onFormatResult = vi.fn()
    render(<PayloadInput onFormatResult={onFormatResult} />)
    fireEvent.change(screen.getByRole("textbox", { name: "Payload WebAuthn" }), { target: { value: "aa" } })
    fireEvent.click(screen.getByRole("button", { name: "Load test sample" }))
    vi.runAllTimers()
    expect(onFormatResult).toHaveBeenCalledTimes(1)
    expect(onFormatResult).toHaveBeenLastCalledWith(expect.objectContaining({ ok: true, format: "base64url" }))
  })

  it("keeps output cleared when a pending keystroke finishes detecting", () => {
    vi.useFakeTimers()
    const onFormatResult = vi.fn()
    render(<PayloadInput onFormatResult={onFormatResult} />)
    fireEvent.change(screen.getByRole("textbox", { name: "Payload WebAuthn" }), { target: { value: "aa" } })
    fireEvent.click(screen.getByRole("button", { name: "Limpar entrada" }))
    vi.runAllTimers()
    expect(onFormatResult).toHaveBeenCalledTimes(1)
    expect(onFormatResult).toHaveBeenLastCalledWith(null)
  })
})


it('does not replace edited transfers when the format changes and samples reset manual detection', () => {
  render(<PayloadInput incomingInput={{ value: 'AQI', key: 1 }} onFormatResult={() => {}} />)
  const input = screen.getByRole('textbox', { name: 'Payload WebAuthn' })
  fireEvent.change(input, { target: { value: '0102' } })
  fireEvent.change(screen.getByRole('combobox', { name: 'Formato de entrada' }), { target: { value: 'hex' } })
  expect(input).toHaveValue('0102')
  fireEvent.click(screen.getByRole('button', { name: 'Load test sample' }))
  expect(input).toHaveValue('YQ')
  expect(screen.getByRole('combobox', { name: 'Formato de entrada' })).toHaveValue('auto')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
