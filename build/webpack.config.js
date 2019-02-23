// Libraries
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// Files
const utils = require('./utils')
const plugins = require('../postcss.config');

// Configuration
module.exports = env => {

  return {
    context: path.resolve(__dirname, '../src'),
    entry: {
      app: './app.js'
    },
    output: {
      path: path.resolve(__dirname, '../dist'),
      publicPath: '/',
      filename: 'assets/js/[name].[hash:7].bundle.js'
    },
    devServer: {
      contentBase: path.resolve(__dirname, '../src'),
    },
    resolve: {
      extensions: ['.js'],
      alias: {
        source: path.resolve(__dirname, '../src'), // Relative path of src
        images: path.resolve(__dirname, '../src/assets/images'), // Relative path of images
        fonts: path.resolve(__dirname, '../src/assets/fonts'), // Relative path of fonts
      }
    },

    /*
      Loaders with configurations
    */
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [/node_modules/],
          use: [
            {
              loader: 'babel-loader',
              options: { presets: ['es2015'] }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            env === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: true,
                minimize: true,
                colormin: false,
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            env === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader, // creates style nodes from JS strings
            { loader: 'css-loader', options: { importLoaders: 1, minimize: true, sourceMap: true, colormin: false } }, // translates CSS into CommonJS
            'postcss-loader',
            'sass-loader', // compiles Sass to CSS
          ],
        },
        {
          test: /\.pug$/,
          use: [
            {
              loader: 'pug-loader'
            }
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 3000,
            name: 'assets/images/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 5000,
            name: 'assets/fonts/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(mp4)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'assets/videos/[name].[hash:7].[ext]'
          }
        }
      ]
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
        }),
      ],
      splitChunks: {
        cacheGroups: {
          default: false,
          vendors: false,
          // vendor chunk
          vendor: {
            filename: 'assets/js/vendor.[hash:7].bundle.js',
            // sync + async chunks
            chunks: 'all',
            // import file path containing node_modules
            test: /node_modules/
          }
        }
      }
    },

    plugins: [
      new CopyWebpackPlugin([
        { from: '../manifest.json', to: 'manifest.json' },
        { from: '../browserconfig.xml', to: 'browserconfig.xml' },
        { from: 'assets/images/favicons/android-chrome-192x192.png', to: 'assets/images/android-chrome-192x192.png' },
        { from: 'assets/images/favicons/android-chrome-256x256.png', to: 'assets/images/android-chrome-256x256.png' },
        { from: 'assets/images/favicons/mstile-150x150.png', to: 'assets/images/mstile-150x150.png' }
      ]),
      new MiniCssExtractPlugin({
        filename: 'assets/css/[name].[hash:7].bundle.css',
        chunkFilename: '[id].css',
      }),

      /*
        Pages
      */

      // // Desktop page
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'views/index.pug',
        inject: true
      }),

      ...utils.pages(env),
      ...utils.pages(env, 'blog'),

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
};
