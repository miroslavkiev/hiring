import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/hiring/', // 👈 This is the critical fix
  plugins: [react()],
})
