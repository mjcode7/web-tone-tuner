let path = require('path');
let common_config = require('./webpack.config.common.babel');
let APP_DIR = common_config.APP_DIR;
let webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

//first line of your application
try {
  require('os').networkInterfaces()
} catch (e) {
  require('os').networkInterfaces = () => ({})
}

const commonResolve = common_config.getResolve();

let config = {
  mode: 'development',
  resolve: {
    ...commonResolve,
    alias: {
      ...commonResolve.alias,
      'react-dom': '@hot-loader/react-dom',
    },
  },
  devtool: 'source-map',
  entry: {
    app: APP_DIR + '/main-dev.js',
  },
  output: common_config.getOutput(),
  module: {
    rules: [
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      common_config.getEsLintLoader(),
      ...common_config.getCommonLoaders(),
      ...common_config.getBabelLoader(),
      common_config.getCssLoaders(),
    ],
  },
  devServer: {
    host: '0.0.0.0',
    port: 12444,
    // publicPath: config.output.publicPath,
    historyApiFallback: true,
    // for windows, hotswapping with non-localhost virtual name
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    // for bash on windows
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      __DEV__: true,
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.hbs',
      baseUrl: 'http://0.0.0.0:12444',
    }),
  ],
};

module.exports = config;
