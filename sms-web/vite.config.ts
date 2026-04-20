import { createVuePlugin } from 'vite-plugin-vue2'
import { defineConfig } from 'vite'
import path from 'path'
import viteSvgIcons from 'vite-plugin-svg-icons'

function resolve(dir) {
  return path.join(__dirname, dir)
}

const httpType = 'https://'
const proxyUrl = '23.33.3.22:60006/' // 代理地址设置

export default defineConfig({
  resolve: {
    alias: {
      vue: 'vue/dist/vue.min.js',
      '@': resolve('src'),
      assets: resolve('src/assets'),
      services: resolve('src/services'),
      utils: resolve('src/common/utils'),
      interface: resolve('src/common/interface'),
      components: resolve('src/common/components'),
      hooks: resolve('src/common/hooks'),
      task: resolve('src/views/task'),
      filters: resolve('src/common/filters'),
      views: resolve('src/views')
    }
  },
  base: '/',
  plugins: [
    // vue()
    createVuePlugin(),
    viteSvgIcons({
      // Specify the icon folder to be cached
      iconDirs: [path.resolve(process.cwd(), './src/icons/svg')],
      // Specify symbolId format
      symbolId: 'icon-[dir]-[name]'
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 8088,
    proxy: {
      // '/api/sms/messageService': {
      //   target: 'ws://' + proxyUrl,
      //   changeOrigin: true,
      //   ws: true
      // },
      '/api': {
        target: httpType + proxyUrl,
        changeOrigin: true,
        secure: false
      },
      '/config-files': {
        target: httpType + proxyUrl,
        secure: false
      },
      '/web-common-resource': {
        target: httpType + proxyUrl,
        secure: false
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/common/css/common-var.scss";',
        charset: false
      }
    }
  }
})
