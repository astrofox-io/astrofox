'use strict';

const gulp = require('gulp');
const cleancss = require('gulp-clean-css');
const duration = require('gulp-duration');
const glsl = require('gulp-glsl');
const iconfont = require('gulp-iconfont');
const less = require('gulp-less');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const template = require('gulp-template');
const uglify = require('gulp-uglify');
const util = require('gulp-util');

const browserify = require('browserify');
const babelify = require('babelify');
const helpers = require('babelify-external-helpers');

const collapse = require('bundle-collapser/plugin');
const watchify = require('watchify');
const envify = require('loose-envify/custom');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const fonts = require('./src/conf/fonts.json');
const vendorIds = Object.keys(require('./package.json').dependencies);
const mainIds = ['electron','path','url','child_process','debug'];

/*** Configuration ***/

const config = {
    app: {
        name: 'AstroFox',
        src: 'src/js/AstroFox.js',
        dest: 'app/browser/js/',
        filename: 'app.js'
    },
    vendor: {
        dest: 'app/browser/js/',
        filename: 'vendor.js',
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
    },
    main: {
        src: 'src/js/main/main.js',
        dest: 'app/',
        filename: 'main.js'
    }
};

const appBundle = {
    entries: config.app.src,
    transform: [babelify],
    extensions: ['.js', '.jsx', '.json'],
    standalone: config.app.name,
    cache: {},
    packageCache: {},
    ignoreMissing: false,
    detectGlobals: false,
    browserField: false,
    builtins: false,
    commondir: false,
    insertGlobalVars: {
        process: undefined,
        global: undefined,
        'Buffer.isBuffer': undefined,
        Buffer: undefined
    }
};

const mainBundle = {
    entries: config.main.src,
    transform: [babelify],
    cache: {},
    packageCache: {},
    ignoreMissing: false,
    detectGlobals: false,
    browserField: false,
    builtins: false,
    commondir: false,
    insertGlobalVars: {
        process: undefined,
        global: undefined,
        'Buffer.isBuffer': undefined,
        Buffer: undefined
    }
};

const vendorBundle = {
    noParse: [require.resolve('babylon')]
};

/*** Functions ***/

// Error reporting
function logError(err) {
    let { red, yellow, magenta, blue } = util.colors;

    if (err.fileName) {
        // Regular error
        util.log(
            red(err.name)
            + ': ' + yellow(err.fileName)
            + ': ' + 'Line ' + magenta(err.lineNumber)
            + ' & ' + 'Column ' + magenta(err.columnNumber || err.column)
            + ': ' + blue(err.description)
        );
    }
    else {
        // Browserify error
        util.log(
            red(err.name)
            + ': '
            + yellow(err.message)
        );
    }
}

// Gets environment setting
function getEnvironment() {
    return process.env.NODE_ENV || 'development';
}

// Builds browserify bundles
function build(bundle, src, dest) {
    return bundle
        .bundle()
        .pipe(duration('bundle time'))
        .pipe(plumber())
        .pipe(source(src))
        .pipe(buffer()) // Convert to gulp pipline
        .pipe(sourcemaps.init({ loadMaps: true })) // Extract the inline sourcemaps
            .pipe(uglify()) // Minify
            .on('error', logError)
        .pipe(sourcemaps.write('.')) // Set folder for sourcemaps to output to
        .pipe(plumber.stop())
        .pipe(gulp.dest(dest));
}

// Builds separate vendor library
function buildVendor() {
    let { filename, dest } = config.vendor;

    let bundle = browserify(vendorBundle)
        .require(vendorIds)
        .transform(
            envify({
                _: 'purge',
                NODE_ENV: getEnvironment()
            }),
            { global: true }
        )
        .plugin(collapse);

    return build(bundle, filename, dest);
}

// Builds application only library
function buildApp() {
    let { filename, dest } = config.app;

    let bundle = browserify(appBundle)
        .external(vendorIds)
        .transform(
            envify({
                _: 'purge',
                NODE_ENV: getEnvironment()
            }),
            { global: true }
        )
        .plugin(helpers)
        .plugin(collapse);

    return build(bundle, filename, dest);
}

// Builds application and watches for changes
function buildAppWatch() {
    let { filename, dest } = config.app;

    let bundle = browserify(appBundle)
        .external(vendorIds)
        .transform(
            envify({
                _: 'purge',
                NODE_ENV: getEnvironment()
            }),
            { global: true }
        )
        .plugin(helpers)
        .plugin(collapse)
        .plugin(watchify, { ignoreWatch: ['**/node_modules/**'] })
        .on('update', ids => {
            util.log(ids);
            build(bundle, filename, dest);
        });

    return build(bundle, filename, dest);
}

// Builds main file for electron
function buildMain() {
    let { filename, dest } = config.main;

    let bundle = browserify(mainBundle)
        .external(mainIds)
        .transform(
            envify({
                _: 'purge',
                NODE_ENV: getEnvironment()
            }),
            { global:true }
        );

    return build(bundle, filename, dest);
}

// Compile LESS into CSS
function buildCss() {
    let { src, dest } = config.css;

    return gulp.src(src)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(cleancss())
        .pipe(sourcemaps.write('.'))
        .pipe(plumber.stop())
        .pipe(gulp.dest(dest));
}

// Build CSS for fonts
function buildFonts() {
    let { templateFile, filename, dest } = config.fonts;

    return gulp.src(templateFile)
        .pipe(plumber())
        .pipe(template({ fonts: fonts }))
        .pipe(rename(filename))
        .pipe(sourcemaps.init())
        .pipe(cleancss())
        .pipe(sourcemaps.write('.'))
        .pipe(plumber.stop())
        .pipe(gulp.dest(dest));
}

// Build icon font library and CSS file
function buildIcons() {
    let { src, templateFile, cssDest, cssFilename, fontDest } = config.icons;

    return gulp.src(src)
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
                .pipe(sourcemaps.init())
                .pipe(cleancss())
                .pipe(sourcemaps.write('.'))
                .pipe(plumber.stop())
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
        .pipe(plumber.stop())
        .pipe(gulp.dest(dest));
}

/*** Tasks ***/

gulp.task('set-dev', () => {
    process.env.NODE_ENV = 'development';
});

gulp.task('set-prod', () => {
    process.env.NODE_ENV = 'production';
});

gulp.task('build-vendor', buildVendor);

gulp.task('build-app', buildApp);

gulp.task('build-app-watch', buildAppWatch);

gulp.task('build-css', buildCss);

gulp.task('build-icons', buildIcons);

gulp.task('build-fonts', buildFonts);

gulp.task('build-shaders', buildShaders);

gulp.task('build-main', buildMain);

gulp.task('build-all', ['build-shaders', 'build-css', 'build-icons', 'build-fonts', 'build-vendor', 'build-app']);

gulp.task('build-dev', ['set-dev', 'build-all']);

gulp.task('build-prod', ['set-prod', 'build-all']);

gulp.task('start-dev', ['set-dev', 'build-shaders', 'build-css', 'build-main', 'build-app-watch'], () => {
    gulp.watch('./src/css/**/*.less', ['build-css']);
    gulp.watch('./src/js/main/**/*.js', ['build-main']);
    gulp.watch('./src/glsl/**/*.glsl', ['build-shaders']);
});

gulp.task('default', ['start-dev']);