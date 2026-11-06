import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import Learn from './App';
import Inspector from '../inspector/App';

afterEach(() => { cleanup(); localStorage.clear(); });

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
