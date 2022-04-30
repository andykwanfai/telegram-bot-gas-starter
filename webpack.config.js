
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GasPlugin = require('gas-webpack-plugin');

const getSrcPath = (filePath) => {
  const src = path.resolve(__dirname, 'src');
  return path.posix.join(src.replace(/\\/g, '/'), filePath);
};

module.exports = {
  entry: './src/main.ts',
  mode: 'production',
  node: {
    global: true
  },
  // optimization: {
  //   minimize: false,
  // },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: getSrcPath('../appsscript.json'),
          to: '[name][ext]',
        },
      ],
    }),
    new GasPlugin(),
  ],
};