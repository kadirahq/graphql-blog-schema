var path = require('path');
var webpack = require('webpack');

var plugins = [new webpack.HotModuleReplacementPlugin()];
var entry = ['./src/index'];

if(process.env.NODE_ENV === "production") {
  plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true, comments: false}));
} else {
  entry.push('webpack-dev-server/client?http://localhost:3000');
  entry.push('webpack/hot/only-dev-server');
}

module.exports = {
  devtool: 'eval',
  entry: entry,
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
