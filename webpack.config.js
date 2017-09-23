const path = require('path');
const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

const PRODUCTION = process.env.NODE_ENV === 'production';
const vendorIds = Object.keys(require('./package.json').dependencies);

const extractLess = new ExtractTextPlugin({
    filename: 'css/[name].css',
    allChunks: true
});

const config = {
    target: 'electron-renderer',
    devtool: PRODUCTION ? false : 'source-map',
    entry: {
        app: path.resolve(__dirname, 'src/js/index.js'),
        vendor: vendorIds
    },
    output: {
        path: path.resolve(__dirname, 'app/browser'),
        filename: 'js/[name].js',
        library: 'Astrofox',
        libraryTarget: 'var'
    },
    resolve: {
        extensions: ['.js', '.json', '.jsx', '.glsl', '.svg'],
        alias: {
            css: path.resolve(__dirname, 'src/css'),
            images: path.resolve(__dirname, 'src/images'),
            glsl: path.resolve(__dirname, 'src/glsl'),
            svg: path.resolve(__dirname, 'src/svg')
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
                test: /\.jsx?$/,
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
                test: /\.(css|less)$/,
                use: extractLess.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                minimize: PRODUCTION
                            }
                        },
                        {
                            loader: 'less-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ],
                    publicPath: '../'
                })
            },
            {
                test: /\.glsl$/,
                use: {
                    loader: 'glsl-loader'
                }
            },
            {
                test: /\.(jpg|png|gif)$/,
                include: path.resolve(__dirname, 'src/images/data'),
                use: {
                    loader: 'url-loader'
                }
            },
            {
                test: /\.(jpg|png|gif)$/,
                include: path.resolve(__dirname, 'src/images/browser'),
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'images/[path][name].[ext]',
                        context: 'src/images/browser'
                    }
                }
            },
            {
                test: /\.svg$/,
                use: {
                    loader: 'svg-sprite-loader',
                    options: {
                        extract: true
                    }
                }
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'fonts/[name].[ext]',
                        publicPath: '../'
                    }
                }
            },
            {
                test: /\.html$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].html'
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'js/[name].js',
            minChunks: Infinity
        }),
        extractLess,
        new SpriteLoaderPlugin()
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