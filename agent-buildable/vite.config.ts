import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Arc components use CSS modules + CSS variables (no Tailwind), so the only
// plugin we need is React. The `@` alias matches the `components.json` aliases
// Arc's docs assume, so `@/components/arc/...` imports resolve.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
})
