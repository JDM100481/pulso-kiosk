import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' produces relative asset paths so the same build works on
// Vercel/Cloudflare Pages (served from root) AND GitHub Pages (served from /repo-name/).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: true, port: 5173 },
})
