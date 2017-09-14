const path = require('path');
const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');

const PRODUCTION = process.env.NODE_ENV === 'production';
const vendorIds = Object.keys(require('./package.json').dependencies);

const config = {
    target: 'electron-renderer',
    devtool: PRODUCTION ? false : 'source-map',
    entry: {
        app: path.resolve(__dirname, 'src/js/index.js'),
        vendor: vendorIds
    },
    output: {
        path: path.resolve(__dirname, 'app/browser/js/'),
        filename: 'app.js',
        library: 'Astrofox',
        libraryTarget: 'var'
    },
    resolve: {
        extensions: ['.js', '.json', '.jsx', '.glsl'],
        alias: {
            glsl: path.resolve(__dirname, 'src/glsl')
        },
        modules: [path.resolve(__dirname, 'src/js'), 'node_modules']
    },
    resolveLoader: {
        modules: [
            'node_modules',
            path.resolve(__dirname, 'build/loaders')
        ]
    },
    module: {
        rules: [
            {
                test: /\.js[x]?$/,
                include: [
                    path.resolve(__dirname, 'src/js')
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                }
            },
            {
                test: /\.glsl$/,
                use: ['glsl-loader']
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.js',
            minChunks: Infinity
        })
    ]
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