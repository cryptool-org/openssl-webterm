const CopyPlugin = require("copy-webpack-plugin")
const HtmlWebPackPlugin = require("html-webpack-plugin")

module.exports = {
    entry: {
        "main": "./index.js"
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].js"
    },
    devServer: {
        port: 4200,
        headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin"
        },
        https: true
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: ["/node_modules/", "/bin/"],
            use: ["babel-loader"]
        }, {
            test: /\.css$/,
            use: ["style-loader", "css-loader"]
        }]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "emscr/binary/*.js", to: "bin/[name][ext]" },
                { from: "emscr/binary/*.wasm", to: "bin/[name][ext]" },
                // { from: "emscr/binary/*.data", to: "bin/[name][ext]" }
            ]
        }),
        new HtmlWebPackPlugin({
            template: "./static/index.html", inject: false
        })
    ],
    optimization: {
        concatenateModules: false,
        minimize: false
    }
}
