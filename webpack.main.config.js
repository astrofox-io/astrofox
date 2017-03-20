const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const PROD = process.env.NODE_ENV === 'production';

const config = {
    target: 'electron',
    node: {
        __dirname: false,
        __filename: false
    },
    entry: {
        main: './src/js/main/main.js',
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
            '__PROD__': PROD
        })
    ],
    externals: [
        nodeExternals({
            modulesFromFile: true
        })
    ]
};

if (PROD) {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            comments: false
        })
    );
}

module.exports = config;