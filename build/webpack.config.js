// Libraries
require('../postcss.config');

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const ASSET_PATH = process.env.ASSET_PATH || '/';


// Files
const utils = require('./utils')

// Configuration
module.exports = env => {

  return {
    context: path.join(__dirname, '../src'),
    entry: {
      app: path.join(__dirname, '../src/app.js'),
    },
    output: {
      publicPath: ASSET_PATH,
      path: path.join(__dirname, '../dist'),
      filename: 'assets/js/[name].[contenthash:7].bundle.js'
    },
    devServer: {
      contentBase: path.join(__dirname, '../src'),
      compress: true,
      open: true
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
            { loader: 'css-loader', options: { importLoaders: 1, sourceMap: true } }, // translates CSS into CommonJS
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
            name: 'assets/images/[name].[contenthash:7].[ext]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 5000,
            name: 'assets/fonts/[name].[contenthash:7].[ext]'
          }
        },
        /* {
          test: /\.(mp4)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'assets/videos/[name].[contenthash:7].[ext]'
          }
        } */
      ]
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
        }),
        new OptimizeCSSAssetsPlugin({})
      ],
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
            test: /node_modules/
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
      new MiniCssExtractPlugin({
        filename: 'assets/css/[name].[chunkhash:7].bundle.css',
        chunkFilename: '[id].css',
      }),

      /*
        Pages
      */

      // Desktop page
      new HtmlWebpackPlugin({
        minify: !env === 'development',
        filename: 'index.html',
        template: 'views/index.pug',
        inject: true
      }),

      ...utils.pages(env), // env, public path, parent folder
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
