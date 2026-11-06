import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ base: '/fido2-demo/', plugins: [react()] })
