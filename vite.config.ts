import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { intlayer } from 'vite-intlayer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), intlayer()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
