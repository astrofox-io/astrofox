'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const duration = require('gulp-duration');
const exit = require('gulp-exit');
const iconfont = require('gulp-iconfont');
const less = require('gulp-less');
const minifycss = require('gulp-minify-css');
const rename = require('gulp-rename');
const template = require('gulp-template');
const uglify = require('gulp-uglify');
const util = require('gulp-util');

const browserify = require('browserify');
const glslify = require('glslify');
const babelify = require('babelify');
const watchify = require('watchify');
const envify = require('envify/custom');

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const nodeResolve = require('resolve');

const _ = require('lodash');

/*** Configuration ***/

var appBundle = browserify({
    entries: './src/js/AstroFox.js',
    transform: [babelify, glslify],
    extensions: ['.js', '.jsx'],
    standalone: 'AstroFox',
    ignoreMissing: false,
    detectGlobals: false,
    cache: {},
    packageCache: {}
});

/*** Functions ***/

function bundle(watch) {
    let timer = duration('bundle time');
    let b = (watch) ?
        watchify(appBundle)
            .on('update', function(ids) {
                util.log(ids);
                bundle();
            }) :
        appBundle;

    return b.bundle()
        .on('error', function(err){
            util.log(util.colors.red(err.message));
        })
        .pipe(timer)
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./build'));
}

function getNPMPackageIds() {
    let manifest = require('./package.json');

    return _.keys(manifest.dependencies) || [];
}

/*** Tasks ***/

// Builds application
gulp.task('build', function() {
    return bundle();
});

// Builds separate vendor library
gulp.task('build-vendor', function() {
    let b = browserify({
        debug: false
    });

    b.transform(envify({
        _: 'purge',
        NODE_ENV: process.env.NODE_ENV || 'development'
    }), { global:true });

    getNPMPackageIds().forEach(function(id) {
        b.require(nodeResolve.sync(id), { expose: id });
    });

    return b.bundle()
        .pipe(source('vendor.js'))
        .pipe(buffer())
        //.pipe(uglify())
        .pipe(gulp.dest('./build'));
});

// Builds application only library
gulp.task('build-app', function() {
    getNPMPackageIds().forEach(function(id) {
        appBundle.external(id);
    });

    return bundle(false);
});

// Builds application and watches for changes
gulp.task('build-watch', function() {
    getNPMPackageIds().forEach(function(id) {
        appBundle.external(id);
    });

    return bundle(true);
});

// Compile LESS into CSS
gulp.task('build-css', function() {
    return gulp.src('./src/css/app.less')
        .pipe(less())
        .pipe(minifycss())
        .pipe(gulp.dest('./build'));
});

// Build font library and CSS file
gulp.task('build-icons', function(){
    gulp.src(['./src/svg/icons/*.svg'])
        .pipe(iconfont({
            fontName: 'icons',
            fontHeight: 300,
            appendUnicode: false,
            normalize: true
        }))
        .on('glyphs', function(glyphs, options) {
            let icons = glyphs.map(function(glyph) {
                return {
                    name: glyph.name,
                    code: glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase()
                };
            });

            gulp.src('/src/svg/icons/template/icons.css.tpl')
                .pipe(template({
                    glyphs: icons,
                    fontName: options.fontName,
                    className: 'icon'
                }))
                .pipe(rename('icons.css'))
                .pipe(gulp.dest('./resources/css/'));
        })
        .pipe(gulp.dest('./resources/fonts/icons/'));
});

gulp.task('dev', ['build-watch', 'build-css'], function() {
    gulp.watch('./src/css/**/*.*', ['build-css']);
});

gulp.task('production', ['build-vendor', 'build-app', 'build-css', 'build-icons']);

gulp.task('default', ['dev']);