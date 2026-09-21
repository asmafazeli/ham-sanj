import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Relative base works on GitHub project pages ( /ham-sanj/ ) and local preview.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
  },
})
