/**
 * Created by Zhang Haijun on 2018/7/24.
 */
const path = require('path')
const { name } = require('./package')
const webpack = require('webpack')
const CompressPlugin = require('compress-webpack-plugin')
// const Components = require('unplugin-vue-components/webpack')
// const AutoImport = require('unplugin-auto-import/webpack')
// const { ElementUiResolver } = require('unplugin-vue-components/resolvers')

function resolve(dir) {
  return path.join(__dirname, dir)
}
const httpType = 'https://'
// const proxyUrl = 'develop.cmp56.com:60006/' // 代理地址设置
const proxyUrl = '10.10.33.92:60006/' // 代理地址设置
// const publicPath = process.env.NODE_ENV === 'production' ? '/cop-web/' : '/cop-web/';
const publicPath = '/cop-web/'
module.exports = {
  publicPath,
  assetsDir: 'static',
  outputDir: 'cop-web',
  // 构建时不进行eslint校验
  lintOnSave: process.env.NODE_ENV !== 'production',
  // 生产环境禁止source map
  productionSourceMap: false,
  runtimeCompiler: true,
  devServer: {
    // https: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    port: 8082,
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
  configureWebpack: config => {
    const plugins = [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      })
      // new webpack.DllReferencePlugin({
      //   context: process.cwd(),
      //   manifest: require('./public/vendor/vendor-manifest.json')
      // })
      // AutoImport({
      //   resolvers: [ElementUiResolver()]
      // }),
      // Components({
      //   resolvers: [ElementUiResolver()]
      // })
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
      plugins,
      output: {
        // 把子应用打包成 umd 库格式
        library: `${name}-[name]`,
        libraryTarget: 'umd',
        jsonpFunction: `webpackJsonp_${name}`
      }
    }
  },
  chainWebpack: config => {
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
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
      .set('filters', resolve('src/filters'))
      .set('views', resolve('src/views'))
      .set('task', resolve('src/views/task'))
      .set('CodeMirror', 'codemirror')
      .set('jQuery', 'jquery')
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

    config.when(process.env.NODE_ENV !== 'development', config => {
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          common: {
            name: 'chunk-common',
            minChunks: 3,
            priority: 0,
            chunks: 'initial',
            reuseExistingChunk: true
          },
          vendors: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 1,
            chunks: 'initial' // only package third parties that are initially dependent
          },
          // elementUI: {
          //   name: 'chunk-element-ui', // split elementUI into a single package
          //   priority: 2, // the weight needs to be larger than libs and app or it will be packaged into libs or app
          //   test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
          // },
          graphEditor: {
            name: 'chunk-graph-editor',
            priority: 2,
            test: /[\\/]node_modules[\\/]_?cmp-graph-editor(.*)/
          }
        }
      })
    })
  }
}
