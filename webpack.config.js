const glob = require('glob');
const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/*************************
 * ENV
 *************************/
const srcDir = "./test/src"; // コンパイル対象フォルダ
const exportDir = "./test/dist"; // 出力先フォルダ
const ignoreDirs = ["includes"]; // 非コンパイルフォルダ名
const ignoreFiles = []; // 非コンパイルファイル名

/*************************
 * ENTRY
 *************************/
const ignores = [].concat(
    ignoreDirs.map(ignoreDir => `js/${ignoreDir}/**/*.js`),
    ignoreFiles.map(ignoreFile => `js/**/${ignoreFile}.js`),
);

const entries = glob.sync("**/*.js", {
    cwd: srcDir,
    ignore: ignores,
})
.map(key => {
    // glob加工 js/index.js => index, js/page/company.js => page/company
    const name = key.replace(/^js\//, "").replace(/.js$/, "");
    return [name, path.resolve(srcDir, key)]
});

const entryObj = Object.fromEntries(entries);

/*************************
 * RUN
 *************************/
module.exports = {
    entry: entryObj,
    output: {
      path: `${__dirname}/${exportDir}`,
      filename: "js/[name].js",
    },
    module: {
        rules: [
            {
                test: /\.(scss|sass|css)$/i,
                use: [ MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader' ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/[name].css",
        }),
        new CleanWebpackPlugin(),
    ],
    performance: { // for webpack performance size limit
        maxEntrypointSize: 500000,
        maxAssetSize: 500000,
    },
};
