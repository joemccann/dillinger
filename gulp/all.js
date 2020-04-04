/** index */
const argv = require('yargs').argv
const gulp = require('gulp')
const browserSync = require('browser-sync')
const gutil = require('gulp-util')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackConfig = require('../webpack.config.js')
const NGAnnotatePlugin = require('ng-annotate-webpack-plugin')
const sequence = require('run-sequence')
// const devTasks = ['webpack:dev', 'sass']
const buildTasks = ['webpack:build', 'sass']
const critical = require('critical')
const csso = require('gulp-csso')
const size = require('gulp-size')
const handleErrors = require('./util/handleErrors')
const zip = require('gulp-zip')
const tar = require('gulp-tar')
const gzip = require('gulp-gzip')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const cmq = require('gulp-group-css-media-queries')
const gulpif = require('gulp-if')
const Server = require('karma').Server
const path = require('path')
const uncss = require('gulp-postcss')

global.isProduction = !!(argv.production || argv.prod)
const watch = argv.watch || null

const globs = [
  './**',
  '!node_modules/**/*',
  '!gulp/**/*',
  '!dist/**/*',
  '!.git/**/*',
  '!public/scss/**/*'
]

/** browserSync ************************************************** */

gulp.task('browserSync', function () {
  browserSync({
    files: ['views/**', 'public/**'],
    proxy: '127.0.0.1:8090',
    notify: true,
    port: 8090,
    host: '127.0.0.1',
    open: 'external'
  })
})

/** webpack ************************************************** */

gulp.task('webpack:dev', function (cb) {
  const
    webpackDevConfig = Object.assign(webpackConfig, {})

  let devCompiler = null

  webpackDevConfig.devtool = 'eval'

  devCompiler = webpack(webpackDevConfig)

  return new WebpackDevServer(devCompiler, {
    proxy: {
      '*': {
        target: 'http://127.0.0.1:8080',
        secure: false
      }
    },
    publicPath: 'http://127.0.0.1:8090/js/',
    hot: false,
    stats: {
      colors: true
    }
  }).listen(8090, '127.0.0.1', function (err) {
    if (err) {
      throw new gutil.PluginError('webpack:dev', err)
    }

    return cb()
  })
})

gulp.task('webpack:build', function (cb) {
  const webpackProductionConfig = Object.assign(webpackConfig, {})

  webpackProductionConfig.plugins = webpackProductionConfig
    .plugins.concat(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new NGAnnotatePlugin({
      add: true
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true
    })
    )

  return webpack(webpackProductionConfig, function (err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack:dev', err)
    }

    gutil.log('[webpack:build]', stats.toString({
      colors: true
    }))

    return cb()
  })
})

/** critical ************************************************** */

gulp.task('critical', function () {
  const dest = './public'

  return critical.generateInline({
    base: dest,
    src: 'index.html',
    styleTarget: 'app.css',
    htmlTarget: 'index.html',
    width: 320,
    height: 480,
    minify: true
  })
})

/** cssminify ************************************************** */

gulp.task('cssminify', function () {
  var dest
  dest = './public/css'
  return gulp.src('./public/css/app.css').on('error', handleErrors)
    .pipe(csso()).pipe(gulp.dest(dest)).pipe(size())
})

gulp.task('cssminify', function () {
  var dest
  dest = './public/css'
  return gulp.src('./public/css/export.css').on('error', handleErrors)
    .pipe(csso()).pipe(gulp.dest(dest)).pipe(size())
})

// /** default ************************************************** */

// gulp.task('default', gulp.series('build', (done) => {
//   done()
// }))

/** dist ************************************************** */

gulp.task('dist', function () {
  const src = gulp.src(globs)

  src.pipe(tar('pre-built.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist'))

  src.pipe(zip('pre-built.zip'))
    .pipe(gulp.dest('dist'))

  return src
})

/** sass ************************************************** */

gulp.task('sass', function () {
  const dest = './public/css'

  console.log('app sass build')

  gulp.src('./public/scss/app.{scss,sass}')
    .pipe(sass({
      precision: 7,
      outputStyle: 'nested'
    }))
    .on('error', handleErrors)
    .pipe(autoprefixer())
    .pipe(gulpif(global.isProduction, cmq({
      log: true
    })))
    .pipe(csso())
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(size())

  console.log('export sass build')

  return gulp.src('./public/scss/export.{scss,sass}')
    .pipe(sass({
      precision: 7,
      outputStyle: 'nested'
    }))
    .on('error', handleErrors)
    .pipe(autoprefixer())
    .pipe(gulpif(global.isProduction, cmq({
      log: true
    })))
    .pipe(csso())
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(size())
})

/** setWatch ************************************************** */

gulp.task('setWatch', function () {
  global.isWatching = true
})

/** test ************************************************** */

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  new Server({
    configFile: path.resolve(__dirname, '../../karma.conf.js'),
    singleRun: true
  }, done).start()
})

/** uncss ************************************************** */

gulp.task('uncss', function () {
  const dest = 'public/test'

  return gulp.src('public/css/app.css')
    .pipe(uncss({
      html: ['http://localhost:8080'],
      ignore: [/zen/, /document/, /modal/, /settings/, /button/,
        /btn/, /toggle/, /menu/, /sidebar/, /dropdown/, /ace/,
        /editor/, /sr/, /form/, /di/, /not/]
    }))
    .on('error', handleErrors)
    .pipe(gulp.dest(dest))
    .pipe(size())
})

/** watch ************************************************** */

if (watch) {
  gulp.task('watch', gulp.series('setWatch', 'build', 'browserSync', function () {
    gulp.watch('public/scss/**/*.{scss,sass,css}', ['sass'])
  }))
}

/** build ************************************************** */

if (global.isProduction) {
  gulp.task('build', function () {
    return sequence(buildTasks)
  })
} else {
  // gulp.task('build', devTasks)
  gulp.task('default', gulp.series('webpack:dev', 'sass', function (done) {
    // default task code here
    done()
  })
  )
}
