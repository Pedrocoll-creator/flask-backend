import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'effective-train-x5v9g99w6xpvh979g-3001.app.github.dev/api/products',
        changeOrigin: true,
      }
    }
  }
})