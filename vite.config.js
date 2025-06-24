import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/hiring/', // 👈 This is the critical fix
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['src/__tests__/**/*.ts?(x)'],
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
  },
})
