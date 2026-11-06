import { useState } from 'react'
import { exportAllData, importData, publicCredential } from '../utils/localStorage'
import { Button } from './ui/button'

export function StorageTools({ onChange }: { onChange: () => void }) {
  const [message, setMessage] = useState('')
  function download(includePrivate: boolean) {
    if (includePrivate && !confirm('Este backup contém chaves privadas simuladas em texto puro. Exporte somente dados de teste e proteja o arquivo. Continuar?')) return
    const data = exportAllData()
    const output = includePrivate ? data : { ...data, credentials: data.credentials.map(publicCredential), generatedKeys: data.generatedKeys.map(publicCredential) }
    const url = URL.createObjectURL(new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = includePrivate ? 'passkey-studio-backup-privado-testes.json' : 'passkey-studio-dados-publicos.json'; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage(includePrivate ? 'Backup privado de testes exportado.' : 'Dados públicos exportados. Chaves privadas omitidas.')
  }
  return <details className="border-t border-[var(--border)] pt-3">
    <summary className="min-h-11 cursor-pointer py-3 text-sm">Exportar ou importar dados de teste</summary>
    <div className="flex flex-wrap items-center gap-3 py-3">
      <Button variant="secondary" onClick={() => download(false)}>Exportar JSON público</Button>
      <Button variant="outline" onClick={() => download(true)}>Exportar backup com chaves privadas simuladas</Button>
      <label className="flex flex-col gap-2 text-sm">Importar backup de testes (substitui dados locais)
        <input type="file" accept="application/json,.json" onChange={async event => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (!file || !confirm('Substituir os dados locais pelos dados deste backup de testes?')) return
          try {
            if (!importData(JSON.parse(await file.text()))) throw new Error()
            onChange(); setMessage('Backup importado.')
          } catch { setMessage('Backup inválido ou armazenamento indisponível. Confira o arquivo e tente novamente.') }
        }} />
      </label>
    </div>
    <p role="status" className="text-sm text-[var(--muted-foreground)]">{message}</p>
  </details>
}
