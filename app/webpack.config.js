const path = require('path')
const distDir = path.resolve(__dirname, '..', 'public')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: {
        index: './entry.js',
        //dummy: './bar.js'
    },
    output: {
        path: distDir,
        filename: '[name].js'
    },
    mode: 'development',
    devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            chunks: ['index'/*, 'dummy'*/]
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'assets', to: 'assets' }
            ]
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use : ['style-loader', 'css-loader']
            },
            {
                test: /\.(hbs)$/,
                use : ['raw-loader']
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use : ['url-loader?limit=100000']
            }
        ]
    }
}