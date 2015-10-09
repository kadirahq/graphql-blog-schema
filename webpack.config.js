var path = require('path');
var webpack = require('webpack');

var plugins = [new webpack.HotModuleReplacementPlugin()];
if(process.env.NODE_ENV === "production") {
  plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true, comments: false}));
}

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: plugins,
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['react-hot', 'babel'],
      include: path.join(__dirname, 'src')
    }]
  }
};
