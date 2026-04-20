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
const proxyUrl = '192.168.4.111:60006' // 代理地址设置
// const proxyUrl = '10.10.33.91:60008' // 代理地址设置
// const proxyUrl = '10.20.7.11:8080' // 代理地址设置
module.exports = {
  assetsDir: 'static',
  outputDir: 'csc-web',
  // 构建时不进行eslint校验
  lintOnSave: process.env.NODE_ENV !== 'production',
  // 生产环境禁止source map
  productionSourceMap: false,
  runtimeCompiler: true,
  devServer: {
    port: 8088,
    overlay: {
      warnings: true,
      errors: true
    },
    proxy: {
      // '/api/cms': {
      //   target: 'ws://' + proxyUrl,
      //   changeOrigin: true,
      //   ws: false
      // },
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
      '/attachment': {
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
  configureWebpack: config => {
    config.module.rules
      .filter(rule => {
        return rule.test.toString().indexOf('scss') !== -1
      })
      .forEach(rule => {
        rule.oneOf.forEach(oneOfRule => {
          oneOfRule.use.splice(oneOfRule.use.indexOf(require.resolve('sass-loader')), 0, { loader: require.resolve('css-unicode-loader') })
        })
      })
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
      plugins
    }
  },
  chainWebpack: config => {
    // 移除 prefetch 插件 在刚进入页面时不加载其他资源, 提升首屏加载速度
    config.plugins.delete('prefetch')
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
  }
}
