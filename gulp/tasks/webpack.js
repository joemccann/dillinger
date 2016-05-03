
'use strict';

var
    gulp             = require('gulp'),
    gulpif           = require('gulp-if'),
    gutil            = require('gulp-util'),
    webpack          = require('webpack'),
    webpackDevServer = require('webpack-dev-server'),
    webpackConfig    = require('../../webpack.config'),
    bundleLogger     = require('../util/bundleLogger'),
    handleErrors     = require('../util/handleErrors'),
    ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

gulp.task('webpack:dev', function(cb) {

  var
    webpackDevConfig = Object.create(webpackConfig),
    devCompiler;

  webpackDevConfig.devtool = 'eval';
  webpackDevConfig.debug   = true;

  devCompiler = webpack(webpackDevConfig);

  return new webpackDevServer(devCompiler, {
    proxy: {
      '*': {
        target: 'http://' + app.get('bind-address') + ':8080',
        secure: false,
      },
    },
    publicPath:  'http://' + app.get('bind-address') + ':8090/js/',
    hot:         false,
    stats: {
      colors: true
    }
  }).listen(8090, app.get('bind-address'), function(err) {

    if (err) {
      throw new gutil.PluginError('webpack:dev', err);
    }

    return cb();
  });
});

gulp.task('webpack:build', function(cb) {

  var webpackProductionConfig = Object.create(webpackConfig);

  webpackProductionConfig.plugins = webpackProductionConfig.plugins.concat(new webpack.DefinePlugin({
    'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new ngAnnotatePlugin({
      add: true
    }),
    new webpack.optimize.UglifyJsPlugin());

  return webpack(webpackProductionConfig, function(err, stats) {

    if (err) {
      throw new gutil.PluginError('webpack:dev', err);
    }

    gutil.log('[webpack:build]', stats.toString({
      colors: true
    }));

    return cb();
  });
});
