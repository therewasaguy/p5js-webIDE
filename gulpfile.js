var gulp = require('gulp');

var uglify = require('gulp-uglify');

var gulpBrowserify = require('gulp-browserify');
var plumber = require('gulp-plumber');
var partialify = require('partialify');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var sass = require('gulp-sass');

var cssPath = './app/**/*.scss';
var jsPath = ['./app/*.js', './app/**/*.js', './app/**/*.html', './public/index.html'];
var debugClientPath = './app/debug/debug-console.js';

// concat all JS files into main.js
gulp.task('browserify', function() {
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
    .pipe(rename('main.js'))
    .pipe(gulp.dest('./public/js/'));
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
      'compass':true,
      'style': 'compressed'
    }).on('error', onError))
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

gulp.task('default', ['css', 'browserify', 'watch']);