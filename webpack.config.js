'use strict';

const webpack = require('webpack');
const path = require('path');
var pathToPhaser = path.join(__dirname, '/node_modules/phaser/');
var phaser = path.join(pathToPhaser, 'dist/phaser.js');

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: "/dist/",
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/'},
            {test: /phaser\.js$/, loader: 'expose-loader?Phaser'},
            {
                test: /\.(png|svg|jpg|gif)$/,
                loader: 'file-loader',
                options: {
                    name: 'assets/[name].[ext]'
                }
            }
        ]
    },
    devServer: {
        contentBase: path.resolve(__dirname, './'),
        publicPath: '/dist/',
        host: '127.0.0.1',
        port: 8080,
        open: true
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            phaser: phaser
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'CANVAS_RENDERER': JSON.stringify(true),
            'WEBGL_RENDERER': JSON.stringify(true)
        })
    ]
};
