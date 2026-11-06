import { expect, test } from 'vitest';
import { diagnostic } from './diagnostics';
import { detectAndNormalize } from './format-detection';

test('keeps actionable format guidance in English', () => {
  const result = detectAndNormalize('AA==');
  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(diagnostic(result.error)).toBe('Standard Base64 detected. Replace + with -, / with _ and remove = padding to get base64url.');
});

test('adds English guidance to parser errors', () => {
  expect(diagnostic("Missing 'challenge' field")).toBe('Missing required field: challenge. Check the WebAuthn response and paste the full payload.');
  expect(diagnostic('authenticatorData too short')).toBe('Incomplete payload. Check the byte length and paste the full value without truncating fields.');
});
