/**
 * Created by Zhang Haijun on 2018/7/24.
 */
const path = require('path')
const webpack = require('webpack')
const CompressPlugin = require('compress-webpack-plugin')
function resolve(dir) {
  return path.join(__dirname, dir)
}
const httpType = 'https://'
const proxyUrl = '10.10.33.172:60006' // EFC 3.0 代理地址设置
const publicPath = process.env.NODE_ENV === 'production' ? '/scr-web/' : '/'
module.exports = {
  publicPath,
  assetsDir: 'static',
  outputDir: 'scr-web',
  // 构建时不进行eslint校验
  lintOnSave: process.env.NODE_ENV !== 'production',
  // 生产环境禁止source map
  productionSourceMap: false,
  devServer: {
    port: 8083,
    overlay: {
      warnings: true,
      errors: true
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
        ws: false
      },
      '/config-files': {
        target: httpType + proxyUrl
      },
      '/scr-web/static/img': {
        target: 'http://localhost:8083',
        pathRewrite: {
          '^/scr-web/static/img': '/static/img' // rewrite path
        }
      }
    }
  },
  configureWebpack: config => {
    const plugins = [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      })
    ]
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
      plugins
    }
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('services', resolve('src/services'))
      .set('utils', resolve('src/utils'))
      .set('components', resolve('src/components'))
      .set('views', resolve('src/views'))
    config.module
      .rule('fonts')
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096, // 小于4kb将会被打包成 base64
        fallback: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[hash:8].[ext]',
            publicPath
          }
        }
      })
      .end()
  }
}
