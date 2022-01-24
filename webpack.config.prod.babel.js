let path = require('path');
let common_config = require('./webpack.config.common.babel');
let APP_DIR = common_config.APP_DIR;
let COMMON_LOADERS = common_config.COMMON_LOADERS;
let webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

let config = {
  mode: 'production',
  // disable verbose logs. https://github.com/webpack-contrib/mini-css-extract-plugin/issues/39
  stats: {
    entrypoints: false,
    children: false,
  },
  resolve: common_config.getResolve(true),
  entry: {
    app: APP_DIR + '/main-prod.js',
  },
  // http://cheng.logdown.com/posts/2016/03/25/679045
  devtool: 'cheap-module-source-map',
  output: common_config.getOutput(true),
  module: {
    rules: [
      common_config.getEsLintLoader(true),
      ...common_config.getCommonLoaders(true),
      ...common_config.getBabelLoader(true),
      common_config.getCssLoaders(true),
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          safe: true,
        },
      }),
    ],
  },
  plugins: [
    new CleanWebpackPlugin(
      [
        'dist',
      ]
    ),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    }),
    // ensure that we get a production build of any dependencies
    // this is primarily for React, where this removes 179KB from the bundle
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      __DEV__: false,
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.hbs',
      baseUrl: 'https://slothtoss.com',
    }),
    new HtmlWebpackExternalsPlugin({
      // don't bundle these libraries; we use them from the CDN
      externals: [
        {
          module: 'react',
          entry: {
            path: 'https://unpkg.com/react@16.7.0/umd/react.production.min.js',
            attributes: {
              integrity: 'sha384-bDWFfmoLfqL0ZuPgUiUz3ekiv8NyiuJrrk1wGblri8Nut8UVD6mj7vXhjnenE9vy',
              crossorigin: 'anonymous',
            },
          },
          global: 'React',
        },
        {
          module: 'react-dom',
          entry: {
            path: 'https://unpkg.com/react-dom@16.7.0/umd/react-dom.production.min.js',
            attributes: {
              integrity: 'sha384-mcyjbblFFAXUUcVbGLbJZR86Xd7La0uD1S7/Snd1tW0N+zhy97geTqVYDQ92c8tI',
              crossorigin: 'anonymous',
            },
          },
          global: 'ReactDOM',
        },
      ],
    }),
  ],
};

module.exports = config;
