const path = require('path')
const { name } = require('./package')
const CompressPlugin = require('compression-webpack-plugin')

function resolve(dir) {
  return path.join(__dirname, dir)
}
const httpType = 'https://'
const proxyUrl = '192.168.4.111:60006/'

const publicPath = process.env.NODE_ENV === 'production' ? '/sms-web/' : '/'
module.exports = {
  publicPath,
  assetsDir: 'static',
  outputDir: 'sms-web',
  lintOnSave: process.env.NODE_ENV !== 'production',
  productionSourceMap: false,
  parallel: false,
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    port: 8085,
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
      .set('filters', resolve('src/filters'))
      .set('views', resolve('src/views'))
  }
}
