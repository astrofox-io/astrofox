const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

const PRODUCTION = process.env.NODE_ENV === 'production';

const config = {
    mode: PRODUCTION ? 'production' : 'development',
    target: 'electron-renderer',
    devtool: PRODUCTION ? false : 'source-map',
    entry: {
        app: path.resolve(__dirname, 'src/app/index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'app/browser'),
        filename: 'js/[name].js',
        library: 'Astrofox',
        libraryTarget: 'var',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        modules: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'src/app'),
            'node_modules',
        ],
    },
    resolveLoader: {
        modules: [
            'node_modules',
            path.resolve(__dirname, 'src/build/loaders'),
        ],
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, 'src'),
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                    },
                },
            },
            {
                test: /\.(css|less)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../',
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            camelCase: true,
                            sourceMap: true,
                            minimize: PRODUCTION,
                            localIdentName: '[name]__[local]--[hash:base64:5]',
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: /\.glsl$/,
                use: {
                    loader: 'glsl-loader',
                },
            },
            {
                test: /\.(jpg|png|gif)$/,
                include: path.resolve(__dirname, 'src/images/data'),
                use: {
                    loader: 'url-loader',
                },
            },
            {
                test: /\.(jpg|png|gif)$/,
                include: path.resolve(__dirname, 'src/images/browser'),
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'images/[path][name].[ext]',
                        context: 'src/images/browser',
                    },
                },
            },
            {
                test: /\.svg$/,
                use: {
                    loader: 'svg-sprite-loader',
                    options: {
                        extract: true,
                    },
                },
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'fonts/[name].[ext]',
                        publicPath: '../',
                    },
                },
            },
            {
                test: /\.html$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].html',
                    },
                },
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: '[id].css',
        }),
        new SpriteLoaderPlugin(),
    ],
};

module.exports = config;
