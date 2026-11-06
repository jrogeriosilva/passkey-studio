/** Translate user-facing diagnostics without changing byte parsers or technical field names. */
export function diagnostic(message: string): string {
  const missing = message.match(/Missing '([^']+)' field/);
  if (missing) return `Campo obrigatório ausente: ${missing[1]}. Confira a resposta WebAuthn e cole o payload completo.`;
  if (/[ãáéíóúç]/i.test(message)) return message;
  if (/too short|bounds|exceeds buffer|remaining/i.test(message)) return 'Payload incompleto. Confira o tamanho dos bytes e cole o valor completo, sem truncar campos.';
  if (/Missing|expected|not a map|unexpected type|not a byte array/i.test(message)) return 'Estrutura inesperada ou campo obrigatório ausente. Confira o envelope JSON e os campos binários da resposta WebAuthn.';
  if (/base64url/i.test(message)) return 'Base64url inválido. Remova aspas e espaços internos; confira se o valor está completo.';
  if (/JSON/i.test(message)) return 'JSON inválido. Confira aspas, vírgulas, chaves e os campos type, challenge e origin.';
  if (/Ambiguous/i.test(message)) return 'Formato ambíguo: hex exige quantidade par de caracteres. Complete o valor ou escolha o formato de entrada.';
  if (/character|Unrecognized/i.test(message)) return 'Formato não reconhecido. Informe JSON, base64url ou hexadecimal, sem aspas externas.';
  if (/No input|Empty input/i.test(message)) return 'Informe um payload completo para começar.';
  if (/CBOR/i.test(message)) return 'Não foi possível ler CBOR. Confira a codificação e se todos os bytes do payload foram copiados.';
  return 'Não foi possível decodificar. Confira o formato, os campos e o tamanho do payload ou use um exemplo sintético.';
}
