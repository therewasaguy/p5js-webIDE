var gulp = require('gulp');

var uglify = require('gulp-uglify');

var gulpMerge = require('gulp-merge');

var gulpBrowserify = require('gulp-browserify');
var plumber = require('gulp-plumber');
var partialify = require('partialify');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var sass = require('gulp-sass');

var inline_base64 = require('gulp-inline-base64');

var cssPath = './app/**/*.scss';
var jsPath = ['./app/*.js', './app/**/*.js', './app/**/*.html', './public/index.html'];
var debugClientPath = './app/debug/debug-console.js';

// concat all JS files into main.js
gulp.task('browserify', function() {

  gulpMerge(

    gulp.src(['./app/libs/jquery.min.js', './app/libs/jquery-ui.min.js'], { read: true })
    .pipe(uglify()),

    gulp.src('./app/main.js', { read: false })
    .pipe(plumber())
    .pipe(gulpBrowserify({
      transform: [partialify],
    }))
    .pipe(uglify())
    .on("error", notify.onError({
      message: "<%= error.message %>",
      title: "Error"
    }))
  )
  .pipe(concat('main.js'))
  // .pipe(rename('main.js'))
  .pipe(gulp.dest('./public/js/'))
});

gulp.task('browserify-dev', function() {

  gulpMerge(

    gulp.src(['./app/libs/jquery.min.js', './app/libs/jquery-ui.min.js'], { read: true })
    .pipe(uglify()),

    gulp.src('./app/main.js', { read: false })
    .pipe(plumber())
    .pipe(gulpBrowserify({
      transform: [partialify],
    }))
    .on("error", notify.onError({
      message: "<%= error.message %>",
      title: "Error"
    }))
  )
  .pipe(concat('main.js'))
  .pipe(gulp.dest('./public/js/'))
});

gulp.task('injected-js', function(){
  return gulp.src([debugClientPath])
    .pipe(concat('debug-console.js'))
    .pipe(gulp.dest('./public/js/'));
});

// concat all CSS files into main.css
gulp.task('css', function() {
	// console.log('css');
  gulp.src(cssPath)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(concat('main.css'))
    .pipe(sass({
      outputStyle: 'compressed'
    })
      .on('error', onError)
    )
    .pipe(inline_base64({
            baseDir: './public',
            maxSize: 18 * 1024,
            debug: true
        }))
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('css-dev', function() {
  // console.log('css');
  gulp.src(cssPath)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(concat('main.css'))
    .pipe(sass({
      outputStyle: 'compressed'
    })
      .on('error', onError)
    )
    .pipe(gulp.dest('./public/css/'));
});

var onError = function (err) {
  console.log(err);
};


// watch for changes to JS and CSS files
gulp.task('watch', function() {
  gulp.watch(jsPath, ['browserify']);
  gulp.watch(cssPath, ['css']);
  gulp.watch(debugClientPath, ['injected-js']);
});

// does not compress fonts/images or uglify js/css
gulp.task('watch-dev', function() {
  gulp.watch(jsPath, ['browserify-dev']);
  gulp.watch(cssPath, ['css-dev']);
  gulp.watch(debugClientPath, ['injected-js']);
});

gulp.task('default', ['css', 'browserify', 'watch']);
gulp.task('dev', ['css-dev', 'browserify-dev', 'watch-dev']);