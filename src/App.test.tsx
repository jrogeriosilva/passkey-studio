import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import App from './App';
vi.mock('./features/learn/App', () => ({ default: () => <div>Learn feature<a href="/webauthn-decoder/?sample=clientdata-create#top">Example link</a></div> }));
vi.mock('./features/lab/App', () => ({ default: () => <div>Lab feature<input aria-label="Lab draft" /></div> }));
vi.mock('./features/inspector/App', () => ({ default: () => <div>Inspector feature</div> }));
vi.stubGlobal('scrollTo', vi.fn());
afterEach(() => { vi.unstubAllEnvs(); cleanup(); window.history.replaceState(null, '', '/'); });

test('switches tools inside the same React application and responds to history navigation', () => {
  window.history.replaceState(null, '', '/');
  render(<App />);
  const header = screen.getByRole('banner');
  expect(screen.getByText('Learn feature')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: /Experimentar/ }));
  expect(window.location.pathname).toBe('/fido2-lab/');
  expect(screen.getByText('Lab feature')).toBeInTheDocument();
  expect(screen.getByRole('banner')).toBe(header);
  expect(screen.getByRole('link', { name: /Experimentar/ })).toHaveAttribute('aria-current', 'page');
  fireEvent.click(screen.getByRole('link', { name: /Inspecionar/ }));
  expect(screen.getByText('Inspector feature')).toBeInTheDocument();
  window.history.replaceState(null, '', '/fido2-demo/');
  fireEvent.popState(window);
  expect(screen.getByText('Learn feature')).toBeInTheDocument();
  expect(document.title).toBe('Aprender · Passkey Studio');
});

test('supports direct entry to a tool and preserves modified link clicks', () => {
  window.history.replaceState(null, '', '/webauthn-decoder/');
  render(<App />);
  expect(screen.getByText('Inspector feature')).toBeInTheDocument();
  const push = vi.spyOn(window.history, 'pushState');
  const link = screen.getByRole('link', { name: /Experimentar/ });
  link.addEventListener('click', event => event.preventDefault(), { once: true });
  fireEvent.click(link, { ctrlKey: true });
  expect(push).not.toHaveBeenCalled();
  push.mockRestore();
});


test('keeps navigation and history inside the GitHub Pages project base', () => {
  vi.stubEnv('BASE_URL', '/passkey-studio/');
  window.history.replaceState(null, '', '/passkey-studio/webauthn-decoder/');
  render(<App />);
  expect(screen.getByText('Inspector feature')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Passkey Studio' })).toHaveAttribute('href', '/passkey-studio/');
  fireEvent.click(screen.getByRole('link', { name: /Experimentar/ }));
  expect(window.location.pathname).toBe('/passkey-studio/fido2-lab/');
  expect(screen.getByText('Lab feature')).toBeInTheDocument();
  window.history.replaceState(null, '', '/passkey-studio/fido2-demo/');
  fireEvent.popState(window);
  expect(screen.getByText('Learn feature')).toBeInTheDocument();
});


test('preserves drafts across tools and keeps query and hash on internal navigation', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('link', { name: /Experimentar/ }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Lab draft' }), { target: { value: 'synthetic draft' } });
  fireEvent.click(screen.getByRole('link', { name: /Aprender/ }));
  fireEvent.click(screen.getByRole('link', { name: 'Example link' }));
  expect(window.location.search).toBe('?sample=clientdata-create');
  expect(window.location.hash).toBe('#top');
  fireEvent.click(screen.getByRole('link', { name: /Experimentar/ }));
  expect(screen.getByRole('textbox', { name: 'Lab draft' })).toHaveValue('synthetic draft');
});

test('explains unknown routes and offers a canonical recovery URL', () => {
  window.history.replaceState(null, '', '/unknown/');
  render(<App />);
  expect(screen.getByRole('status')).toHaveTextContent('Área não encontrada');
  expect(screen.getByRole('link', { name: 'Abrir a rota Aprender' })).toHaveAttribute('href', '/fido2-demo/');
});
