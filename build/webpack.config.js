// Libraries
require('../postcss.config')

const path = require('path')
const webpack = require('webpack')
const WebpackNotifierPlugin = require('webpack-notifier')
const CopyWebpackPlugin = require('copy-webpack-plugin')

// Note: the single pug-plugin replaces functionality of plugins and loaders:
// - html-webpack-plugin
// - mini-css-extract-plugin
// - pug-loader
const PugPlugin = require('pug-plugin')

const ASSET_PATH = process.env.ASSET_PATH || '/'

// Files
const utils = require('./utils')

// Configuration
module.exports = (env) => {
  // Get default mode from env
  const MODE = env.mode || 'production'
  const isDev = utils.isDevMode(MODE)

  return {
    mode: MODE,
    target: 'web',
    devtool: 'eval-source-map',
    context: path.join(__dirname, '../src'),

    entry: {
      // Define all pages here.
      // Using pug-plugin the entry point for each page is Pug template.
      // All source scripts and styles must be defined directly in Pug using `require()`.
      
      index: '../src/views/index.pug', // => dist/index.html

      ...utils.pages(), // other pages
      ...utils.pages('blog'), // folder name under pages

      // Note: utils.pages() and utils.pages('blog') generates following entries (you can define the entries manual)
      //'contact/index': '../src/views/pages/contact.pug', // => dist/contact/index.html
      //'blog/index': '../src/views/pages/blog.pug',
      //'blog/example-post/index': '../src/views/pages/blog/example-post.pug',
    },

    output: {
      //publicPath: ASSET_PATH,

      // all asset paths will be auto resolved relative to ther issuers,
      // useful to open index.html in browser from local generated `dist/` directory
      publicPath: 'auto',
      path: path.join(__dirname, '../dist'),
      filename: 'assets/js/[name].[contenthash:7].bundle.js'
    },

    devServer: {
      static: {
        directory: path.join(__dirname, '../dist'),
      },
      compress: true,
      open: true,
      watchFiles: {
        paths: [path.join(__dirname,'../src/**/*.*')],
        options: {
          usePolling: true,
        },
      },
    },

    resolve: {
      extensions: ['.js'],
      alias: {
        source: path.join(__dirname, '../src'), // Relative path of src
        images: path.join(__dirname, '../src/assets/images'), // Relative path of images
        fonts: path.join(__dirname, '../src/assets/fonts'), // Relative path of fonts
      }
    },

    /*
      Loaders with configurations
    */
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: [/node_modules/],
          use: [
            {
              loader: 'babel-loader',
              options: { presets: ['@babel/preset-env'] }
            }
          ]
        },
        {
          test: /\.(css|scss)$/,
          use: [
            'css-loader', // translates CSS into CommonJS, note: use defaults options
            'postcss-loader',
            'sass-loader', // compiles Sass to CSS
          ],
        },
        {
          test: /\.pug$/,
          loader: PugPlugin.loader,
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name].[contenthash:7][ext]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name].[contenthash:7][ext]'
          }
        },
        /*{
          test: /\.(mp4)(\?.*)?$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/videos/[name].[contenthash:7][ext]'
          },
        }*/
      ]
    },
    experiments: {
      topLevelAwait: true,
    },
    optimization: {
      // note: CSS and JS will be automatically minified via Webpack 5 in `production` mode
      splitChunks: {
        cacheGroups: {
          default: false,
          vendors: false,
          // vendor chunk
          vendor: {
            filename: 'assets/js/vendor.[chunkhash:7].bundle.js',
            // sync + async chunks
            chunks: 'all',
            // import file path containing node_modules
            test: /[\\/]node_modules[\\/].+\.(js|ts)$/, // use exactly this Regexp to match JS files only
          }
        }
      }
    },

    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: '../manifest.json', to: 'manifest.json' },
          { from: '../browserconfig.xml', to: 'browserconfig.xml' },
          { from: 'assets/images/favicons/android-chrome-192x192.png', to: 'assets/images/android-chrome-192x192.png' },
          { from: 'assets/images/favicons/android-chrome-256x256.png', to: 'assets/images/android-chrome-256x256.png' },
          { from: 'assets/images/favicons/mstile-150x150.png', to: 'assets/images/mstile-150x150.png' }
        ]
      }),

      // enable processing of Pug files defined in entry
      new PugPlugin({
        //verbose: isDev, // display processing information
        pretty: isDev, // formatting of HTML
        // extract CSS from style sources defined in Pug
        extractCss: {
          filename: 'assets/css/[name].[contenthash:7].css',
        },
      }),

      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.$': 'jquery',
        'window.jQuery': 'jquery'
      }),

      new WebpackNotifierPlugin({
        title: 'Your project'
      })
    ]
  }
}
