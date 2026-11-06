import { useState } from 'react'
import { exportAllData, importData, publicCredential } from '../utils/localStorage'
import { Button } from './ui/button'

export function StorageTools({ onChange }: { onChange: () => void }) {
  const [message, setMessage] = useState('')
  function download(includePrivate: boolean) {
    if (includePrivate && !confirm('This backup contains simulated private keys in plain text. Export only test data and protect the file. Continue?')) return
    const data = exportAllData()
    const output = includePrivate ? data : { ...data, credentials: data.credentials.map(publicCredential), generatedKeys: data.generatedKeys.map(publicCredential) }
    const url = URL.createObjectURL(new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = includePrivate ? 'passkey-studio-private-test-backup.json' : 'passkey-studio-public-data.json'; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage(includePrivate ? 'Private test backup exported.' : 'Public data exported. Private keys omitted.')
  }
  return <details className="border-t border-[var(--border)] pt-3">
    <summary className="min-h-11 cursor-pointer py-3 text-sm">Export or import test data</summary>
    <div className="flex flex-wrap items-center gap-3 py-3">
      <Button variant="secondary" onClick={() => download(false)}>Export public JSON</Button>
      <Button variant="outline" onClick={() => download(true)}>Export backup with simulated private keys</Button>
      <label className="flex flex-col gap-2 text-sm">Import test backup (replaces local data)
        <input type="file" accept="application/json,.json" onChange={async event => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (!file || !confirm('Replace local data with this test backup?')) return
          try {
            if (!importData(JSON.parse(await file.text()))) throw new Error()
            onChange(); setMessage('Backup imported.')
          } catch { setMessage('Invalid backup or storage unavailable. Check the file and try again.') }
        }} />
      </label>
    </div>
    <p role="status" className="text-sm text-[var(--muted-foreground)]">{message}</p>
  </details>
}
