const path = require('path')
const { name } = require('./package')
const CompressPlugin = require('compression-webpack-plugin')

function resolve(dir) {
  return path.join(__dirname, dir)
}
const httpType = 'https://'
const proxyUrl = '192.168.4.111:60006' // EFC 3.0 代理地址

const publicPath = process.env.NODE_ENV === 'production' ? '/cmp-web/' : '/'
module.exports = {
  publicPath,
  transpileDependencies: [/@ss-cmp\//],
  assetsDir: 'static',
  outputDir: 'cmp-web',
  lintOnSave: process.env.NODE_ENV !== 'production',
  productionSourceMap: false,
  parallel: false,
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    port: 8083,
    client: {
      overlay: { errors: true, warnings: false, runtimeErrors: false }
    },
    proxy: {
      '/api/sms/messageService': {
        target: 'ws://' + proxyUrl,
        changeOrigin: true,
        ws: false
      },
      '/api': {
        target: httpType + proxyUrl,
        changeOrigin: true,
        secure: false
      },
      '/captcha': { target: httpType + proxyUrl },
      '/config-files': { target: httpType + proxyUrl },
      '/web-common-resource': { target: httpType + proxyUrl }
    }
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: '@import "@/common/css/common-var.scss";'
      },
      css: {
        // 绝对路径（如 /web-common-resource/*）走后端 proxy，webpack 不解析
        url: { filter: (url) => !url.startsWith('/') }
      }
    }
  },
  configureWebpack: () => {
    const plugins = []
    if (process.env.NODE_ENV === 'production') {
      plugins.push(
        new CompressPlugin({
          test: /\.js$|\.html$|\.css$/,
          threshold: 10240,
          deleteOriginalAssets: false
        })
      )
    }
    return {
      plugins,
      output: {
        library: `${name}-[name]`,
        libraryTarget: 'umd',
        chunkLoadingGlobal: `webpackJsonp_${name}`
      }
    }
  },
  chainWebpack: (config) => {
    // svg-sprite-loader
    config.module.rule('svg').exclude.add(resolve('src/icons')).end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({ symbolId: 'icon-[name]' })
      .end()
    config.resolve.alias
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('services', resolve('src/services'))
      .set('utils', resolve('src/common/utils'))
      .set('interface', resolve('src/common/interface'))
      .set('components', resolve('src/common/components'))
      .set('hooks', resolve('src/common/hooks'))
      .set('task', resolve('src/views/task'))
      .set('filters', resolve('src/common/filters'))
      .set('views', resolve('src/views'))
      // 强制 vue / element-plus / @element-plus/icons-vue 单实例
      // 防止 @ss-cmp/* peerDep 被 pnpm auto-install-peers 装出独立副本（pitfall 39）
      .set('vue$', resolve('node_modules/vue'))
      .set('element-plus$', resolve('node_modules/element-plus'))
      .set('@element-plus/icons-vue$', resolve('node_modules/@element-plus/icons-vue'))
    config.module
      .rule('fonts')
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096,
        fallback: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]',
            publicPath: '/web-common-resource'
          }
        }
      })
      .end()
  }
}
