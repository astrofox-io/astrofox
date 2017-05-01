const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const __PROD__ = process.env.NODE_ENV === 'production';

const config = {
    target: 'electron-main',
    node: {
        __dirname: false,
        __filename: false
    },
    entry: {
        main: path.resolve(__dirname, 'src/js/main/main.js'),
    },
    output: {
        path: path.resolve(__dirname, 'app'),
        filename: 'main.js'
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
    plugins: [
        new webpack.DefinePlugin({
            '__PROD__': __PROD__
        })
    ],
    externals: [
        nodeExternals({
            modulesFromFile: true
        })
    ]
};

if (__PROD__) {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            comments: false
        })
    );
}

module.exports = config;