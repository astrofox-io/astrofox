'use strict';

const del = require('del');
const gulp = require('gulp');
const cleancss = require('gulp-clean-css');
const glsl = require('gulp-glsl');
const iconfont = require('gulp-iconfont');
const gulpif = require('gulp-if');
const less = require('gulp-less');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const template = require('gulp-template');
const gutil = require('gulp-util');
const webpack = require('webpack');

/*** Configuration ***/

const appConfig = require('./webpack.config');
const mainConfig = require('./webpack.main.config');
const fontConfig = require('./src/config/fonts.json');

const config = {
    main: {
        src: 'src/js/main/main.js',
        dest: 'app/',
        filename: 'main.js'
    },
    css: {
        src: 'src/css/app.less',
        dest: 'app/browser/css/',
        sourcemap: '.'
    },
    icons: {
        src: 'src/svg/icons/*.svg',
        templateFile: 'src/build/templates/icons.css.tpl',
        cssDest: 'app/browser/css/',
        cssFilename: 'icons.css',
        fontDest: 'fonts/icons/'
    },
    fonts: {
        templateFile: 'src/build/templates/fonts.css.tpl',
        filename: 'fonts.css',
        dest: 'app/browser/css/'
    },
    glsl: {
        src: 'src/glsl/**/*.glsl',
        dest: 'src/js/lib/',
        filename: 'ShaderCode.js'
    }
};

/*** Functions ***/

// Gets environment setting
function getEnvironment() {
    return process.env.NODE_ENV || 'development';
}

// Logs webpack output
function logWebpack(done, watch) {
    return (err, stats) => {
        if (err) {
            throw new gutil.PluginError('[webpack]', err);
        }

        gutil.log(stats.toString({
            chunks: false,
            colors: true
        }));

        if (done && !watch) {
            done();
            watch = true;
        }
    };
}

// Builds application bundles
function buildJs(done) {
    webpack(appConfig)
        .run(logWebpack(done));
}

// Builds application bundles and watches for changes
function buildJsWatch(done) {
    let watch = false;

    webpack(appConfig)
        .watch({
            aggregateTimeout: 300,
            ignored: /node_modules/
        },
            logWebpack(done, watch)
        );
}

// Builds main file for electron
function buildMain(done) {
    webpack(mainConfig)
        .run(logWebpack(done));
}

// Compile LESS into CSS
function buildCss() {
    let { src, dest } = config.css;

    return gulp.src(src)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(gulpif(getEnvironment() === 'production', cleancss()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
}

// Build CSS for fonts
function buildFonts() {
    let { templateFile, filename, dest } = config.fonts;

    return gulp.src(templateFile)
        .pipe(plumber())
        .pipe(template({ fonts: fontConfig }))
        .pipe(gulpif(getEnvironment() === 'production', cleancss()))
        .pipe(rename(filename))
        .pipe(gulp.dest(dest));
}

// Build icon font library and CSS file
function buildIcons() {
    let { src, templateFile, cssDest, cssFilename, fontDest } = config.icons;

    return gulp.src(src)
        .pipe(plumber())
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

            return gulp.src(templateFile)
                .pipe(plumber())
                .pipe(template({
                    glyphs: icons,
                    fontName: options.fontName,
                    className: 'icon'
                }))
                .pipe(rename(cssFilename))
                .pipe(gulpif(getEnvironment() === 'production', cleancss()))
                .pipe(gulp.dest(cssDest));
        })
        .pipe(gulp.dest(fontDest));
}

// Compile GLSL into JS
function buildShaders() {
    let { src, filename, dest } = config.glsl;

    return gulp.src(src)
        .pipe(plumber())
        .pipe(glsl({ format: 'object' }))
        .pipe(rename(filename))
        .pipe(gulp.dest(dest));
}

/*** Tasks ***/

gulp.task('set-dev', () => {
    process.env.NODE_ENV = 'development';
});

gulp.task('set-prod', () => {
    process.env.NODE_ENV = 'production';
});

gulp.task('build-js', buildJs);

gulp.task('build-js-watch', buildJsWatch);

gulp.task('build-main', buildMain);

gulp.task('build-css', buildCss);

gulp.task('build-icons', buildIcons);

gulp.task('build-fonts', buildFonts);

gulp.task('build-shaders', buildShaders);

gulp.task('build-all', ['build-shaders', 'build-css', 'build-icons', 'build-fonts', 'build-main', 'build-js']);

gulp.task('build-dev', ['set-dev', 'build-all']);

gulp.task('build-prod', ['set-prod', 'build-all'], () => {
    // Remove sourcemaps
    del(['./app/**/*.map']);
});

gulp.task('start-dev', ['set-dev', 'build-shaders', 'build-css', 'build-main', 'build-js-watch'], () => {
    // Watch for changes
    gulp.watch('./src/css/**/*.less', ['build-css']);
    gulp.watch('./src/js/main/**/*.js', ['build-main']);
    gulp.watch('./src/glsl/**/*.glsl', ['build-shaders']);
});

gulp.task('default', ['start-dev']);