/** Add recovery guidance without changing byte parsers or technical field names. */
export function diagnostic(message: string): string {
  const missing = message.match(/Missing '([^']+)' field/);
  if (missing) return `Missing required field: ${missing[1]}. Check the WebAuthn response and paste the full payload.`;
  if (/\b(?:Check|Enter|Remove|Replace|Use)\b/.test(message)) return message;
  if (/too short|bounds|exceeds buffer|remaining/i.test(message)) return 'Incomplete payload. Check the byte length and paste the full value without truncating fields.';
  if (/Missing|expected|not a map|unexpected type|not a byte array/i.test(message)) return 'Unexpected structure or missing required field. Check the JSON envelope and binary fields of the WebAuthn response.';
  if (/base64url/i.test(message)) return 'Invalid base64url. Remove quotes and internal spaces; check that the value is complete.';
  if (/JSON/i.test(message)) return 'Invalid JSON. Check quotes, commas, braces and the type, challenge and origin fields.';
  if (/Ambiguous/i.test(message)) return 'Ambiguous format: hex requires an even number of characters. Complete the value or choose an input format.';
  if (/character|Unrecognized/i.test(message)) return 'Unrecognized format. Enter JSON, base64url or hexadecimal without surrounding quotes.';
  if (/No input|Empty input/i.test(message)) return 'Enter a full payload to begin.';
  if (/CBOR/i.test(message)) return 'Could not read CBOR. Check the encoding and that all payload bytes were copied.';
  return 'Could not decode. Check the format, fields and payload size, or use a synthetic sample.';
}
