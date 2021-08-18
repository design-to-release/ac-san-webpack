# Atomic Class Webpack Plugin & Loader For [San](https://github.com/baidu/san)

[![tag](https://img.shields.io/github/tag/design-to-release/ac-san-webpack.svg)](https://github.com/design-to-release/ac-san-webpack)
[![Build Status](https://github.com/design-to-release/ac-san-webpack/workflows/ci/badge.svg?branch=main)](https://github.com/design-to-release/ac-san-webpack/actions)
[![license](https://img.shields.io/github/license/design-to-release/ac-san-webpack.svg)](https://github.com/design-to-release/ac-san-webpack)

## Usage

### Installation

```
npm i design-to-release/ac-san-webpack#0.0.1
```

### Basic Configuration

```js
// webpack.config.js
const SanLoaderPlugin = require('san-loader/lib/plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ACSanWebpack = require('ac-san-webpack');

const { join } = require('path');

module.exports = {
  entry: join(__dirname, './src/main.js'),
  output: {
    path: join(__dirname, './dist'),
  },
  devServer: {
    port: 8888,
  },
  module: {
    rules: [
      {
        test: /\.san$/,
        use: [
          { loader: 'san-loader', options: { esModule: true } },
          { loader: ACSanWebpack.loader },
        ],
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({ template: './index.html' }),
    new SanLoaderPlugin({ esModule: true }),
    new ACSanWebpack.Plugin({
      css: { paths: ['./global1.css', './global2.css'] },
    }),
  ],
};
```
