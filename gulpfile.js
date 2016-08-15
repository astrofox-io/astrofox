'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const cleancss = require('gulp-clean-css');
const duration = require('gulp-duration');
const exit = require('gulp-exit');
const iconfont = require('gulp-iconfont');
const less = require('gulp-less');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const template = require('gulp-template');
const uglify = require('gulp-uglify');
const util = require('gulp-util');

const browserify = require('browserify');
const glslify = require('glslify');
const babelify = require('babelify');
const watchify = require('watchify');
const envify = require('loose-envify/custom');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const resolve = require('resolve');

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

function build(bundle, src, dest, watch, min) {
    let timer = duration('bundle time');

    let b = (watch) ?
        watchify(bundle)
            .on('update', ids => {
                util.log(ids);
                build(bundle, src, dest, false, min);
            }) :
        bundle;

    let minify = (min) ? uglify : util.noop;

    return b.bundle()
        .on('error', err => {
            util.log(util.colors.red(err.message));
        })
        .pipe(plumber())
        .pipe(timer)
        .pipe(source(src))
        .pipe(buffer())
        .pipe(minify())
        .pipe(plumber.stop())
        .pipe(gulp.dest(dest));
}

function getNPMPackageIds() {
    let manifest = require('./package.json');

    return _.keys(manifest.dependencies) || [];
}

/*** Tasks ***/

// Builds separate vendor library
gulp.task('build-vendor', function() {
    let vendorBundle = browserify({
        debug: false
    });

    vendorBundle.transform(envify({
        _: 'purge',
        NODE_ENV: process.env.NODE_ENV || 'development'
    }), { global:true });

    getNPMPackageIds().forEach(id => {
        vendorBundle.require(resolve.sync(id), { expose: id });
    });

    return build(vendorBundle, 'vendor.js', 'build', false, (process.env.NODE_ENV === 'production'));
});

// Builds application only library
gulp.task('build-app', () => {
    appBundle.transform(envify({
        _: 'purge',
        NODE_ENV: process.env.NODE_ENV
    }), { global:true });

    getNPMPackageIds().forEach(id => {
        appBundle.external(id);
    });

    return build(appBundle, 'app.js', 'build', false, (process.env.NODE_ENV === 'production'));
});

// Builds application and watches for changes
gulp.task('build-app-watch', () => {
    appBundle.transform(envify({
        _: 'purge',
        NODE_ENV: process.env.NODE_ENV
    }), { global:true });

    getNPMPackageIds().forEach(id => {
        appBundle.external(id);
    });

    return build(appBundle, 'app.js', 'build', true, false);
});

// Compile LESS into CSS
gulp.task('build-css', () => {
    let minify = (process.env.NODE_ENV === 'production') ? cleancss : util.noop;

    return gulp.src('./src/css/app.less')
        .pipe(less())
        .pipe(minify())
        .pipe(gulp.dest('./build'));
});

// Build font library and CSS file
gulp.task('build-icons', () => {
    return gulp.src(['./src/svg/icons/*.svg'])
        .pipe(iconfont({
            fontName: 'icons',
            fontHeight: 300,
            appendUnicode: false,
            normalize: true
        }))
        .on('glyphs', (glyphs, options) => {
            let icons = glyphs.map(glyph => {
                return {
                    name: glyph.name,
                    code: glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase()
                };
            });

            return gulp.src('./src/svg/icons/template/icons.css.tpl')
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

gulp.task('set-dev', () => {
    process.env.NODE_ENV = 'development';
});

gulp.task('set-prod', () => {
    process.env.NODE_ENV = 'production';
});

gulp.task('build-all', ['build-vendor', 'build-app', 'build-css', 'build-icons']);

gulp.task('build-dev', ['set-dev', 'build-all']);

gulp.task('build-prod', ['set-prod', 'build-all']);

gulp.task('build-dev-watch', ['set-dev', 'build-app-watch', 'build-css'], () => {
    gulp.watch('./src/css/**/*.*', ['build-css']);
});

gulp.task('default', ['build-dev-watch']);