var path = require('path');
var webpack = require('webpack');

var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('shared.js');
var fetchPlugin = new webpack.ProvidePlugin({'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'});

module.exports = {
    context: path.resolve('src'),
    entry: {
        map: './map/app.jsx',
        converter: './converter/app.jsx',

    },
    output: {
        path: path.resolve('public/build'),
        filename: "[name].js"
    },
    plugins: [
        commonsPlugin,
        fetchPlugin
    ],

    module: {
        loaders: [
            {
                test: [/\.jsx$/],
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            { test: /\.json$/, loader: 'json' }
        ]
    },

    //watchOptions: {
    //    poll: 1000,
    //    aggregateTimeout: 1000
    //},

    resolve: {
        extensions: ['', '.js', '.jsx', '.es6'],
        modulesDirectories: [
            'node_modules',
            'bower_components'
        ]
    }
};
