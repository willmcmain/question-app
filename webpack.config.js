module.exports = {
    entry: './src/index.js',
    output: {
        filename: './static/bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            }
        ]
    }
}
