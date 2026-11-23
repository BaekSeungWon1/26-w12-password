import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // Netlify 및 GitHub Pages 배포 경로 호환
  plugins: [react()],
})