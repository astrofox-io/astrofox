const path = require('path');
const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');

const PRODUCTION = process.env.NODE_ENV === 'production';

const config = {
    target: 'electron-main',
    node: {
        __dirname: false,
        __filename: false
    },
    entry: {
        main: path.resolve(__dirname, 'src/main/index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'app'),
        filename: 'main.js'
    },
    resolve: {
        extensions: ['.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src/js')
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                }
            }
        ]
    },
    plugins: []
};

if (PRODUCTION) {
    config.plugins.push(
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new MinifyPlugin(
            {},
            {
                test: /\.js$/,
                comments: false
            }
        )
    );
}

module.exports = config;