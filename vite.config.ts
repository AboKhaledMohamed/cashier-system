import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// Dynamic import for ESM-only packages
const tailwindcss = async () => {
  const mod = await import('@tailwindcss/vite')
  return mod.default
}

export default defineConfig(async () => ({
  plugins: [
    react(),
    (await tailwindcss())(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Base path for Electron (use relative paths so file:// works)
  base: './',
  // File types to support raw imports
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: true,
  },
}))
