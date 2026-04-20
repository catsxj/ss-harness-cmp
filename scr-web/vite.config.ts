import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      assets: resolve(__dirname, 'src/assets'),
      services: resolve(__dirname, 'src/services'),
      utils: resolve(__dirname, 'src/utils'),
      components: resolve(__dirname, 'src/components'),
      views: resolve(__dirname, 'src/views')
    }
  },
  server: {
    port: 8083,
    proxy: {
      '/api/sms/messageService': {
        target: 'ws://10.10.33.172:60006',
        changeOrigin: true,
        ws: false
      },
      '/api': {
        target: 'https://10.10.33.172:60006',
        changeOrigin: true,
        ws: false,
        secure: false
      },
      '/config-files': {
        target: 'https://10.10.33.172:60006',
        secure: false
      }
    }
  },
  build: {
    outDir: 'scr-web',
    rollupOptions: {
      external: [
        /^\/scr-web\/static\//
      ]
    }
  },
  css: {
    preprocessorOptions: {
      scss: {}
    }
  }
})
