/**
 * Created by Zhang Haijun on 2018/7/24.
 */
const path = require('path')
const { name } = require('./package')
const webpack = require('webpack')
const CompressPlugin = require('compress-webpack-plugin')

function resolve(dir) {
  return path.join(__dirname, dir)
}
const httpType = 'https://'
const proxyUrl = '192.168.4.111:60006/' // 代理地址设置
// const proxyUrl = '10.20.51.92:7001' // 代理地址设置
// const proxyUrl = '10.10.2.60:50006/' 苏州代理地址
module.exports = {
  assetsDir: 'static',
  outputDir: 'cos-web',
  // 构建时不进行eslint校验
  lintOnSave: process.env.NODE_ENV !== 'production',
  // 生产环境禁止source map
  productionSourceMap: false,
  runtimeCompiler: true,
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    port: 8084,
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
        secure: false
      },
      '/captcha': {
        target: httpType + proxyUrl
      },
      '/config-files': {
        target: httpType + proxyUrl
      },
      '/web-common-resource': {
        target: httpType + proxyUrl
      }
    }
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: '@import "@/common/css/common-var.scss";'
      }
    }
  },
  configureWebpack: (config) => {
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
        // 把子应用打包成 umd 库格式
        library: `${name}-[name]`,
        libraryTarget: 'umd',
        jsonpFunction: `webpackJsonp_${name}`
      }
    }
  },
  chainWebpack: (config) => {
    // set svg-sprite-loader
    config.module.rule('svg').exclude.add(resolve('src/icons')).end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
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
    config.module
      .rule('fonts')
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096, // 小于4kb将会被打包成 base64
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
