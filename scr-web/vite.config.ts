import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import type { Plugin } from 'vite'

// 将 /scr-web/static/* 重写为 /static/*（开发模式下 public/ 映射到根路径）
function scrWebStaticRewrite(): Plugin {
  return {
    name: 'scr-web-static-rewrite',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith('/scr-web/static/')) {
          req.url = req.url.replace('/scr-web/static/', '/static/')
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), scrWebStaticRewrite()],
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
