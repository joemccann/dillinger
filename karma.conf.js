
var fullWebpackConfig, webpackConfig;

fullWebpackConfig = require('./webpack.config.js');

webpackConfig = {
  module: fullWebpackConfig.module,
  resolve: fullWebpackConfig.resolve,
  plugins: fullWebpackConfig.plugins,
  devtool: 'eval',
  cache: true
};

module.exports = function(config) {
  return config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: ['public/js/**/*.spec.js'],
    exclude: [],
    preprocessors: {
      '**/*.js': ['webpack']
    },
    webpack: webpackConfig,
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false
  });
};
