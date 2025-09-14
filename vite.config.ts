import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Pose-AI/',
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['uuid']
    }
  }
})
