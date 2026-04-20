import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver, ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import styleImport from 'vite-plugin-style-import'

function resolve(dir: string) {
  return path.join(__dirname, dir)
}

const httpType = 'https://'
const proxyUrl = '192.168.4.111:60006/' // 代理地址设置

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    createSvgIconsPlugin({
      // Specify the icon folder to be cached
      iconDirs: [path.resolve(process.cwd(), './src/icons/svg')],
      // Specify symbolId format
      symbolId: 'icon-[dir]-[name]'
    }),
    Components({
      resolvers: [AntDesignVueResolver(), ElementPlusResolver()]
    }),
    styleImport({
      libs: [
        {
          libraryName: 'ant-design-vue',
          esModule: true,
          resolveStyle: (name: string) => {
            return `ant-design-vue/es/${name}/style/index`
          }
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': resolve('src'),
      assets: resolve('src/assets'),
      services: resolve('src/services'),
      utils: resolve('src/utils'),
      interface: resolve('src/interface'),
      components: resolve('src/components'),
      hooks: resolve('src/hooks'),
      filters: resolve('src/filters'),
      views: resolve('src/views')
    }
  },
  server: {
    port: 8080,
    proxy: {
      // '/api/sms/messageService': {
      //   target: `ws://${proxyUrl}`,
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
        additionalData: '@import "@/css/common-var.scss";',
        charset: false
      },
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#1E54D5'
        },
        charset: false
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule: any) => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              }
            }
          }
        ]
      }
    }
  },
  build: {
    outDir: 'main-web',
    assetsDir: 'static'
  }
})
