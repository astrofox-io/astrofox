const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
  mode: PRODUCTION ? 'production' : 'development',
  devtool: PRODUCTION ? false : 'source-map',
  target: 'electron-preload',
  node: {
    __dirname: false,
    __filename: false,
  },
  entry: {
    preload: path.resolve(__dirname, 'src/main/preload.js'),
  },
  output: {
    path: path.resolve(__dirname, 'app'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src/js')],
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        }],
      },
    ],
  },
  optimization: {
    minimize: PRODUCTION,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
};
