var gulp = require('gulp');
var browserify = require('gulp-browserify');
var plumber = require('gulp-plumber');
var partialify = require('partialify');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var sass = require('gulp-sass');

var cssPath = './app/**/*.scss';
var jsPath = ['./app/*.js', './app/**/*.js', './app/**/*.html', './public/index.html'];


// concat all JS files into main.js
gulp.task('browserify', function() {
  gulp.src('./app/main.js', { read: false })
    .pipe(plumber())
    .pipe(browserify({
      transform: [partialify],
    }))
    .on("error", notify.onError({
      message: "<%= error.message %>",
      title: "Error"
    }))
    .pipe(rename('main.js'))
    .pipe(gulp.dest('./public/js/'));
});


// concat all CSS files into main.css
gulp.task('css', function() {
	console.log('css');
  gulp.src(cssPath)
    .pipe(plumber())
    .pipe(concat('main.css'))
    .pipe(sass({
      //outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./public/css/'));
});


// watch for changes to JS and CSS files
gulp.task('watch', function() {
  gulp.watch(jsPath, ['browserify']);
  gulp.watch(cssPath, ['css']);
  // gulp.watch(debugClientPath, ['injected-js']);
});

gulp.task('default', ['css', 'browserify', 'watch']);