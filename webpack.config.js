const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const glob = require('glob');

// HTMLファイルを動的に取得し、必要なバンドルを割り当てる
const htmlPlugins = glob.sync('./src/**/*.html').map((file) => {
  const filename = path.relative('./src', file);

  let outputFilename;
  let chunk;

  if (filename === 'as/index.html') {
    outputFilename = 'as/index.html';
    chunk = ['as'];
  } else if (filename === 'simulation/index.html') {
    outputFilename = 'simulation/index.html';
    chunk = ['simulation'];
  } else if (filename === 'data/index.html') {
    outputFilename = 'data/index.html';
    chunk = ['data'];
  }

  return new HtmlWebpackPlugin({
    filename: outputFilename,
    template: file,
    inject: 'body',
    chunks: chunk,
    scriptLoading: 'module',
    minify: false,
  });
});

module.exports = {
  mode: 'production',
  entry: {
    as: ['./src/js/utils.js', './src/css/as.css'],
    simulation: ['./src/js/utils.js', './src/js/premiumTables.js', './src/js/simulation.js', './src/css/simulation.css'],
    data: ['./src/js/utils.js', './src/js/data.js', './src/css/data.css'],
  },
  output: {
    filename: (pathData) => {
      return `${pathData.chunk.name}/js/[name].bundle.js`;
    },
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'src'),
    },
    hot: true,
    open: true,
    watchFiles: {
      paths: ['src/**/*.html', 'src/**/*.css', 'src/**/*.js'],
      options: {
        usePolling: true,
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif|webp|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: ({ chunk }) => {
        return `${chunk.name}/css/[name].css`;
      },
    }),
    ...htmlPlugins,
    new CopyWebpackPlugin({
      patterns: [{ from: 'src/images', to: 'images' }],
    }),
  ],
};
