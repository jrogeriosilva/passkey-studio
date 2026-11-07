import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import Learn from './App';
import Inspector from '../inspector/App';

afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); window.history.replaceState({}, '', '/'); });

test('always renders English and places the payload guide in Learn', () => {
  localStorage.setItem('fido2demo.lang', 'pt');
  render(<Learn />);
  expect(screen.getByRole('heading', { name: 'FIDO2 ceremonies, step by step' })).toBeInTheDocument();
  expect(screen.queryByRole('radiogroup', { name: 'Language' })).not.toBeInTheDocument();
  expect(screen.queryByRole('radio', { name: 'PT' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Understanding FIDO2 and WebAuthn Payloads'));
  expect(screen.getByRole('heading', { name: 'FIDO2 and the credential lifecycle' })).toBeVisible();
  expect(within(screen.getByRole('article')).getByRole('link', { name: 'Inspect' })).toHaveAttribute('href', '/webauthn-decoder/');
});

test('keeps the payload guide out of Inspect', () => {
  render(<Inspector />);
  expect(screen.getByRole('heading', { name: 'Inspect WebAuthn payloads' })).toBeInTheDocument();
  expect(screen.queryByText('Understanding FIDO2 and WebAuthn Payloads')).not.toBeInTheDocument();
});

test('reveals sequence events through the selected step and clears future events on rewind', () => {
  render(<Learn />);
  fireEvent.click(screen.getByRole('radio', { name: 'Sequence' }));
  const diagram = within(screen.getByRole('region', { name: 'Interactive ceremony sequence' }));
  expect(diagram.getAllByRole('button')).toHaveLength(1);

  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(diagram.getAllByRole('button')).toHaveLength(2);
  expect(diagram.getAllByRole('button')[1]).toHaveAttribute('aria-current', 'step');
  fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
  expect(diagram.getAllByRole('button')).toHaveLength(1);

  const steps = within(screen.getByRole('complementary')).getAllByRole('button');
  fireEvent.click(steps[steps.length - 1]);
  expect(diagram.getAllByRole('button')).toHaveLength(steps.length);
  fireEvent.click(diagram.getAllByRole('button')[1]);
  expect(diagram.getAllByRole('button')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
  expect(diagram.getAllByRole('button')).toHaveLength(1);
});

test('keeps sequence events synchronized with playback, pause, replay and view changes', () => {
  vi.useFakeTimers();
  render(<Learn />);
  fireEvent.click(screen.getByRole('radio', { name: 'Sequence' }));
  const diagram = () => within(screen.getByRole('region', { name: 'Interactive ceremony sequence' }));
  fireEvent.click(screen.getByRole('button', { name: 'Play' }));
  act(() => { vi.advanceTimersToNextTimer(); });
  expect(diagram().getAllByRole('button')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
  act(() => { vi.advanceTimersByTime(10000); });
  expect(diagram().getAllByRole('button')).toHaveLength(2);

  fireEvent.click(screen.getByRole('radio', { name: 'Real World' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  fireEvent.click(screen.getByRole('radio', { name: 'Sequence' }));
  expect(diagram().getAllByRole('button')).toHaveLength(3);

  const steps = within(screen.getByRole('complementary')).getAllByRole('button');
  fireEvent.click(steps[steps.length - 1]);
  fireEvent.click(screen.getByRole('button', { name: 'Replay' }));
  expect(diagram().getAllByRole('button')).toHaveLength(1);
  act(() => { vi.advanceTimersToNextTimer(); });
  expect(diagram().getAllByRole('button')).toHaveLength(2);
});

test('freezes the isometric scene timeline deterministically when ?t=N is provided', () => {
  window.history.replaceState({}, '', '/fido2-demo/?ceremony=hello&mode=register&step=6&t=1.2');
  render(<Learn />);
  expect(window.__ready).toBe(true);
  expect(window.__isoDuration).toBeGreaterThan(0);
  const scenes = screen.getAllByRole('img', { name: /Server \(Relying Party\), Browser \(client\), Windows Hello/i });
  expect(scenes[0].querySelectorAll('.iso-top').length).toBeGreaterThan(0);
  expect(scenes[0].querySelectorAll('.iso-front').length).toBeGreaterThan(0);
  expect(scenes[0].querySelectorAll('.iso-side').length).toBeGreaterThan(0);
  window.history.replaceState({}, '', '/');
});

test('syncs ceremony, mode and step query parameters as the user navigates', () => {
  window.history.replaceState({}, '', '/fido2-demo/');
  render(<Learn />);
  expect(window.location.search).toBe('');

  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(window.location.search).toBe('?ceremony=usb&mode=register&step=2');

  fireEvent.click(screen.getByRole('radio', { name: /Authentication/i }));
  expect(window.location.search).toBe('?ceremony=usb&mode=login&step=2');

  fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
  fireEvent.click(screen.getByRole('radio', { name: /Registration/i }));
  expect(window.location.search).toBe('');
});
