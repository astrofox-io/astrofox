const path = require('path');
const webpack = require('webpack');

const vendorIds = Object.keys(require('./package.json').dependencies);
const PROD = process.env.NODE_ENV === 'production';

const config = {
    target: 'electron-renderer',
    devtool: (PROD) ? false : 'source-map',
    entry: {
        app: './src/js/index.js',
        vendor: vendorIds
    },
    output: {
        path: path.resolve(__dirname, 'app/browser/js/'),
        filename: 'app.js',
        library: 'Astrofox',
        libraryTarget: 'var'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
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
            'process.env.NODE_ENV': JSON.stringify((PROD) ? 'production' : 'development')
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.js',
            minChunks: Infinity
        })
    ]
};

if (PROD) {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            comments: false,
            sourceMap: false
        })
    );
}

module.exports = config;