'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat-util');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var cssmin = require('gulp-cssmin');
var meta = require('./package.json');

var paths = {
  output: {
    js: 'dist/js',
    css: 'dist/css',
    font: 'dist/font'
  },
  js: 'src/js/' + meta.name + '.js',
  scss: 'src/scss/' + meta.name + '.scss',
  font: 'src/font/*'
};

var header = [
  '/**', '\n',
  ' *  ', meta.name, ' v', meta.version, '\n',
  ' *  ', meta.repository.url, '\n',
  ' *  MIT License - ', meta.author.name, '\n',
  ' */\n\n'
].join('');

gulp.task('js', function () {
  return gulp.src(paths.js)
    .pipe(concat.header(header))
    .pipe(gulp.dest(paths.output.js))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.output.js));
});

gulp.task('scss', function () {
  return gulp.src(paths.scss)
    .pipe(sass())
    .pipe(concat.header(header))
    .pipe(gulp.dest(paths.output.css));
});

gulp.task('css', ['scss'], function () {
  return gulp.src([paths.output.css, '/', meta.name, '.css'].join(''))
    .pipe(cssmin())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.output.css));
});

gulp.task('font', function () {
  return gulp.src(paths.font)
    .pipe(gulp.dest(paths.output.font));
});

gulp.task('default', ['js', 'css', 'font']);
