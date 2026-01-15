import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  server: {
    port: 5173,
    proxy: {
      '/admin/auth': 'http://localhost:3002',
      '/admin/users': 'http://localhost:3002',
      '/admin/tokens': 'http://localhost:3002',
      '/admin/audit': 'http://localhost:3002',
      '/admin/stats': 'http://localhost:3002',
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
