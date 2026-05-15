import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    ssr: true,
    outDir: 'dist/server',
    rollupOptions: {
      input: 'src/entry-server.tsx',
      output: {
        entryFileNames: 'entry-server.js',
      },
    },
  },
  ssr: {
    noExternal: ['react-helmet-async'],
  },
})
