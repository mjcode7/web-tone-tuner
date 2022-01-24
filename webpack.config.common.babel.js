import {TsconfigPathsPlugin} from 'tsconfig-paths-webpack-plugin';

let path = require('path');
let webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const APP_DIR = path.resolve(__dirname, 'src');

function getEsLintLoader(isProd = false) {
  return {
    enforce: 'pre',
    test: /\.([jt])sx?$/,
    include: APP_DIR,
    use: [
      {
        loader: 'eslint-loader',
        options: {
          configFile: isProd ? './.eslintrc_prod' : './.eslintrc',
        },
      },
    ],
  };
}

function getCssLoaders(isProd = false) {
  return {
    test: /(\.css|\.less)$/,
    use: [
      {
        loader: isProd ? MiniCssExtractPlugin.loader : 'style-loader',
      },
      {
        loader: 'typings-for-css-modules-loader',
        options: {
          modules: true,
          minimize: true,
          namedExport: true,
          camelCase: true,
          localIdentName: '[path]__[name]__[local]__[hash:base64:5]',
        },
      },
      {
        loader: 'less-loader',
        options: {
          paths: [
            path.resolve(__dirname, 'src/components'),
          ],
        },
      },
    ],
  };
}

function getOutput(isProd = false) {
  return {
    path: path.resolve(__dirname, './dist'),
    publicPath: isProd ? './app/' : '/',
    // `filename` provides a template for naming your bundles (remember to use `[name]`)
    filename: isProd ? 'js/[name].[chunkhash].bundle.js' : '[name].bundle.js',
    // `chunkFilename` provides a template for naming code-split bundles (optional)
    chunkFilename: isProd ? 'js/[name].[chunkhash].bundle.js' : '[name].bundle.js',
    // fix for webworkers when hotswapping is used https://github.com/webpack-contrib/worker-loader/issues/166
    globalObject: !isProd ? 'this' : undefined,
  };
}

// we only transpile a few node_modules which contain es6 code
const transpileDependencies = [
  'tone',
  'image-capture',
];

// loader which transpiles es6 to es5 and ts to js
function getTranspileLoader(isProd = false) {
  const configSuffix = isProd ? 'prod' : 'dev';
  return [
    {
      include: new RegExp(`node_modules/(${transpileDependencies.join('|')})/.*`),
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
        },
      },
    },
    {
      test: /(\.tsx|\.jsx|\.js|\.ts)$/,
      include: APP_DIR,
      exclude: /node_modules/,
      use: [
        {
          loader: 'awesome-typescript-loader',
          options: {
            configFileName: `tsconfig.${configSuffix}.json`,
            silent: process.argv.indexOf('--json') !== -1,
          },
        },
      ],
    },
  ];
}

function getResolve(isProd = false) {
  const configSuffix = isProd ? 'prod' : 'dev';
  return {
    // allow non-relative imports
    plugins: [
      new TsconfigPathsPlugin({
          configFile: `tsconfig.${configSuffix}.json`,
      }),
    ],
    modules: [
      path.resolve('./src'),
      path.resolve('./resources'),
      path.resolve('./node_modules'),
    ],
    extensions: ['.ts', '.tsx', '.js'],
  };
}

function getCommonLoaders(isProd = false) {
  return [
    {
      test: /\.(png|gif|jpg)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'url-loader?limit=8192',
        },
      ],
    },
    {
      test: /\.svg$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'svg-react-loader',
        },
      ],
    },
    {
      test: /\.hbs$/,
      use: 'handlebars-loader',
    },
    {
      test: /\.worker\.js$/,
      use: [
        {
          loader: 'worker-loader',
          options: {
            filename: 'js/[name].[contenthash].worker.js',
          },
        },
      ],
    },
  ];
}

module.exports = {
  APP_DIR: APP_DIR,
  getCommonLoaders,
  getBabelLoader: getTranspileLoader,
  getResolve,
  getOutput,
  getEsLintLoader,
  getCssLoaders,
};
