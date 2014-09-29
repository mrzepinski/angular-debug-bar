'use strict';

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat-util'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-cssmin'),
    meta = require('./package.json');

var paths = {
        output: {
            js: 'dist/js',
            css: 'dist/css'
        },
        scss: 'src/scss/' + meta.name + '.scss',
        js: 'src/js/' + meta.name + '.js'
    },
    description = {
        top: '// ' + meta.title + ' - ' + meta.author.name + '\n' +
            '// ' + meta.repository.url + ' - MIT License\n'
    };

gulp.task('lint', function(){
    return gulp.src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('js', ['lint'], function(){
    return gulp.src(paths.js)
        .pipe(concat.header(description.top))
        .pipe(gulp.dest(paths.output.js))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.output.js));
});

gulp.task('scss', function () {
    return gulp.src(paths.scss)
        .pipe(concat.header(description.top))
        .pipe(sass())
        .pipe(gulp.dest(paths.output.css));
});

gulp.task('css', ['scss'], function () {
    return gulp.src(paths.output.css + '/' + meta.name + '.css')
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.output.css));
});

gulp.task('default', ['js', 'css']);
