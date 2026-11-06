export function labError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') return 'Operação cancelada ou expirada. Verifique o autenticador e tente novamente.'
    if (error.name === 'SecurityError') return 'A origem não pode usar este RP ID. Abra o Lab no domínio do RP e confira rp.id.'
    if (error.name === 'InvalidStateError') return 'A credencial já existe neste autenticador. Use outra conta ou revise excludeCredentials.'
    if (error.name === 'NotSupportedError') return 'Este autenticador não suporta as opções ou o algoritmo solicitado.'
    if (error.name === 'EncodingError') return 'As opções contêm um valor binário inválido. Confira challenge, user.id e os identificadores em base64url.'
    if (error.name === 'InvalidCharacterError') return 'Base64url inválido. Remova aspas e confira os bytes copiados.'
  }
  return error instanceof Error ? error.message : 'Não foi possível concluir. Confira a entrada e tente novamente.'
}
