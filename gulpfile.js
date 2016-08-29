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
const babelify = require('babelify');
const watchify = require('watchify');
const envify = require('loose-envify/custom');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const glsl = require('./src/build/gulp-compile-shaders.js');

/*** Configuration ***/

const vendorIds = Object.keys(require('./package.json').dependencies);

const appBundle = browserify({
    entries: './src/js/AstroFox.js',
    transform: [babelify],
    extensions: ['.js', '.jsx'],
    standalone: 'AstroFox',
    ignoreMissing: false,
    detectGlobals: false,
    cache: {},
    packageCache: {}
});

/*** Functions ***/

function getEnvironment() {
    return process.env.NODE_ENV || 'development';
}

function build(bundle, src, dest) {
    let minify = (getEnvironment() === 'production') ? uglify : util.noop;

    return bundle.bundle()
        .on('error', err => {
            util.log(util.colors.red(err.message));
        })
        .pipe(plumber())
        .pipe(duration('bundle time'))
        .pipe(source(src))
        .pipe(buffer())
        .pipe(minify())
        .pipe(plumber.stop())
        .pipe(gulp.dest(dest));
}

// Builds separate vendor library
function buildVendor() {
    let vendorBundle = browserify({
        debug: false,
        noParse: [require.resolve('babylon')]
    });

    vendorBundle.transform(envify({
        _: 'purge',
        NODE_ENV: getEnvironment()
    }), { global:true });

    vendorIds.forEach(id => {
        vendorBundle.require(require.resolve(id), { expose: id });
    });

    return build(vendorBundle, 'vendor.js', 'build');
}

// Builds application only library
function buildApp() {
    appBundle.transform(envify({
        _: 'purge',
        NODE_ENV: getEnvironment()
    }), { global:true });

    vendorIds.forEach(id => {
        appBundle.external(id);
    });

    return build(appBundle, 'app.js', 'build');
}

// Builds application and watches for changes
function buildAppWatch() {
    appBundle.transform(envify({
        _: 'purge',
        NODE_ENV: getEnvironment()
    }), { global:true });

    vendorIds.forEach(id => {
        appBundle.external(id);
    });

    watchify(appBundle).on('update', ids => {
        util.log(ids);
        build(appBundle, 'app.js', 'build');
    });

    return build(appBundle, 'app.js', 'build');
}

// Compile LESS into CSS
function buildCss() {
    let minify = (getEnvironment() === 'production') ? cleancss : util.noop;

    return gulp.src('src/css/app.less')
        .pipe(less())
        .pipe(minify())
        .pipe(gulp.dest('build'));
}

// Build font library and CSS file
function buildIcons() {
    return gulp.src('src/svg/icons/*.svg')
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

            return gulp.src('src/build/templates/icons.css.tpl')
                .pipe(template({
                    glyphs: icons,
                    fontName: options.fontName,
                    className: 'icon'
                }))
                .pipe(rename('icons.css'))
                .pipe(gulp.dest('resources/css/'));
        })
        .pipe(gulp.dest('resources/fonts/icons/'));
}

// Compile GLSL into JS
function buildShaders() {
    return gulp.src('src/glsl/**/*.glsl')
        .pipe(plumber())
        .pipe(glsl())
        .pipe(rename('ShaderCode.js'))
        .pipe(plumber.stop())
        .pipe(gulp.dest('src/js/lib/'));
}

/*** Tasks ***/

gulp.task('build-vendor', buildVendor);

gulp.task('build-app', buildApp);

gulp.task('build-app-watch', buildAppWatch);

gulp.task('build-css', buildCss);

gulp.task('build-icons', buildIcons);

gulp.task('build-shaders', buildShaders);

gulp.task('set-dev', () => {
    process.env.NODE_ENV = 'development';
});

gulp.task('set-prod', () => {
    process.env.NODE_ENV = 'production';
});

gulp.task('build-all', ['build-vendor', 'build-app', 'build-css', 'build-icons']);

gulp.task('build-dev', ['set-dev', 'build-all']);

gulp.task('build-prod', ['set-prod', 'build-all']);

gulp.task('build-watch', ['set-dev', 'build-app-watch', 'build-css', 'build-shaders'], () => {
    gulp.watch('./src/css/**/*.less', ['build-css']);
    gulp.watch('./src/glsl/**/*.glsl', ['build-shaders']);
});

gulp.task('default', ['build-watch']);