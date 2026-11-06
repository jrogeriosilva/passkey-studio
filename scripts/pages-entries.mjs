import { copyFile, mkdir } from 'node:fs/promises';

// Pages has no SPA rewrite rules. Each public route serves the same React entry.
for (const route of ['fido2-demo', 'fido2-lab', 'webauthn-decoder']) {
  await mkdir(`dist/${route}`, { recursive: true });
  await copyFile('dist/index.html', `dist/${route}/index.html`);
}
