import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 项目页部署在 /<repo>/ 子路径下，生产环境需要对应 base
  base: process.env.NODE_ENV === 'production' ? '/svg-archive/' : '/',
  plugins: [preact(), tailwindcss()],
})
