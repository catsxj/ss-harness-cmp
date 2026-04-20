const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// const CleanPackageAfterCopyIndexPlugin = require('./plugins/cleanPackage')

const resolve = dir => path.resolve(__dirname, dir)

module.exports = {
  mode: 'production',
  entry: './src/views/resource-apply/index.js',
  output: {
    path: path.join(__dirname, './resourceApply'),
    filename: 'index.js',
    library: 'resourceApply',
    libraryTarget: 'umd'
  },
  externals: {
    vue: 'vue',
    'vue-router': 'vue-router',
    axios: 'axios',
    'element-ui': 'element-ui',
    'lodash-es': 'lodash-es',
    vuex: 'vuex',
    'crypto-js': 'crypto-js',
    'utils/request': 'utils/request',
    clipboard: 'clipboard',
    dayjs: 'dayjs',
    'cmp-graph': 'cmp-graph',
    'cmp-element/components/code-mirror': 'cmp-element/components/code-mirror'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.mjs', '.js', '.jsx', '.vue', '.json', '.wasm'],
    alias: {
      '@': resolve('src'),
      vue$: 'vue/dist/vue.runtime.esm.js',
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
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.ts$/,
        use: [{ loader: 'babel-loader' }, { loader: 'ts-loader' }]
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ],
        exclude: [path.resolve(__dirname, 'node_modules')]
      },
      {
        test: /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          outputPath: './asset',
          publicPath: './asset'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        loader: 'file-loader',
        options: {
          outputPath: './asset',
          publicPath: './asset'
        }
      },
      {
        test: /\.css$/,
        use: [
          // MiniCssExtractPlugin.loader,
          'vue-style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          // MiniCssExtractPlugin.loader,
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              prependData: '@import "@/common/css/common-var.scss";',
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
    // new CleanPackageAfterCopyIndexPlugin({
    //   tempPath: '../packages',
    //   finalPath: '../resourceApply'
    // }),
    // new BundleAnalyzerPlugin(
    //   {
    //     analyzerMode: 'server',
    //     analyzerHost: '127.0.0.1',
    //     analyzerPort: 1314,
    //     reportFilename: 'report.html',
    //     defaultSizes: 'parsed',
    //     openAnalyzer: true,
    //     generateStatsFile: false,
    //     statsFilename: 'stats.json',
    //     statsOptions: null,
    //     logLevel: 'info'
    //   }
    // )
  ],
  optimization: {
    usedExports: true
  }
}
