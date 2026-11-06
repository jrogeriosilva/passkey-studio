import { defineConfig } from 'vite';
const apps = ['fido2-demo', 'fido2-lab', 'webauthn-decoder'];
export default defineConfig({
  server: {
    proxy: Object.fromEntries(apps.map((app, i) => [`/${app}`, {
      target: `http://127.0.0.1:${5181 + i}`, ws: true,
    }])),
  },
});
