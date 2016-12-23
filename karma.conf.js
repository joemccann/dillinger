
'use strict';

var fullWebpackConfig = require('./webpack.config.js');

fullWebpackConfig.devtool = 'eval';
fullWebpackConfig.cache = true;

module.exports = function(config) {
  return config.set({
    basePath:   '',
    frameworks: ['jasmine-jquery','jasmine'],
    files:      [
      'public/js/app.js',
      'public/js/**/*.spec.js'
    ],
    exclude: [],
    preprocessors: {
      'public/js/app.js': ['webpack'],
      'public/js/**/*.spec.js': ['webpack']
    },
    webpack:       fullWebpackConfig,
    webpackServer: {
      noInfo: true
    },
    reporters: ['progress'],
    port:      9876,
    colors:    true,
    logLevel:  config.LOG_INFO,
    autoWatch: true,
    browsers:  ['PhantomJS'],
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine-jquery',
      'karma-jasmine',
      'karma-webpack' 
    ],
    singleRun: false,
    concurrency: Infinity
  });
};
