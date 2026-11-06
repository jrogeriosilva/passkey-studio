export function labError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') return 'Operation cancelled or timed out. Check the authenticator and try again.'
    if (error.name === 'SecurityError') return 'This origin cannot use this RP ID. Open the Lab on the RP domain and check rp.id.'
    if (error.name === 'InvalidStateError') return 'The credential already exists on this authenticator. Use another account or review excludeCredentials.'
    if (error.name === 'NotSupportedError') return 'This authenticator does not support the requested options or algorithm.'
    if (error.name === 'EncodingError') return 'The options contain an invalid binary value. Check challenge, user.id and the base64url identifiers.'
    if (error.name === 'InvalidCharacterError') return 'Invalid base64url. Remove quotes and check the copied bytes.'
  }
  return error instanceof Error ? error.message : 'Could not complete the operation. Check the input and try again.'
}
