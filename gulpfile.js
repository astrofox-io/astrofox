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
const collapse = require('bundle-collapser/plugin');
const watchify = require('watchify');
const envify = require('loose-envify/custom');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const fonts = require('./src/conf/fonts.json');
const vendorIds = Object.keys(require('./package.json').dependencies);

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
        cssfilename: 'icons.css',
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

const appBundle = browserify({
    entries: config.app.src,
    transform: [babelify],
    extensions: ['.js', '.jsx'],
    standalone: config.app.name,
    ignoreMissing: false,
    detectGlobals: false,
    cache: {},
    packageCache: {}
});

const mainBundle = browserify({
    entries: config.main.src,
    transform: [babelify],
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

    return bundle
        .plugin(collapse)
        .bundle()
        .on('error', err => {
            util.log(util.colors.red(err.message));
        })
        .pipe(plumber())
        .pipe(duration('bundle time'))
        .pipe(source(src))
        .pipe(buffer())
        //.pipe(minify())
        .pipe(plumber.stop())
        .pipe(gulp.dest(dest));
}

// Builds separate vendor library
function buildVendor() {
    let { filename, dest } = config.vendor;

    let vendorBundle = browserify({
        debug: false,
        noParse: [require.resolve('babylon')]
    });

    vendorIds.forEach(id => {
        vendorBundle.require(require.resolve(id), { expose: id });
    });

    vendorBundle.transform(envify({
        _: 'purge',
        NODE_ENV: getEnvironment()
    }), { global:true });

    return build(vendorBundle, filename, dest);
}

// Builds application only library
function buildApp() {
    let { filename, dest } = config.app;

    vendorIds.forEach(id => {
        appBundle.external(id);
    });

    appBundle.transform(envify({
        _: 'purge',
        NODE_ENV: getEnvironment()
    }), { global:true });

    return build(appBundle, filename, dest);
}

// Builds application and watches for changes
function buildAppWatch() {
    let { filename, dest } = config.app;

    appBundle.transform(envify({
        _: 'purge',
        NODE_ENV: getEnvironment()
    }), { global:true });

    vendorIds.forEach(id => {
        appBundle.external(id);
    });

    watchify(
        appBundle,
        { ignoreWatch: ['**/node_modules/**']}
    )
        .on('update', ids => {
            util.log(ids);
            build(appBundle, filename, dest);
        });

    return build(appBundle, filename, dest);
}

// Compile LESS into CSS
function buildCss() {
    let { src, dest } = config.css,
        minify = (getEnvironment() === 'production') ? cleancss : util.noop;

    return gulp.src(src)
        .pipe(plumber())
        .pipe(less())
        .pipe(minify())
        .pipe(plumber.stop())
        .pipe(gulp.dest(dest));
}

// Build CSS for fonts
function buildFonts() {
    let { templateFile, filename, dest } = config.fonts,
        minify = (getEnvironment() === 'production') ? cleancss : util.noop;

    return gulp.src(templateFile)
        .pipe(plumber())
        .pipe(template({
            fonts: fonts
        }))
        .pipe(minify())
        .pipe(rename(filename))
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
                .pipe(template({
                    glyphs: icons,
                    fontName: options.fontName,
                    className: 'icon'
                }))
                .pipe(rename(cssFilename))
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

// Builds main file for electron
function buildMain() {
    let { filename, dest } = config.main;

    process.env.NODE_ENV = 'production';

    ['electron','path','url','child_process','debug'].forEach(id => {
        mainBundle.external(id);
    });

    mainBundle.transform(envify({
        _: 'purge',
        NODE_ENV: getEnvironment()
    }), { global:true });

    return build(mainBundle, filename, dest);
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

gulp.task('start-dev', ['set-dev', 'build-shaders', 'build-css', 'build-app-watch'], () => {
    gulp.watch('./src/css/**/*.less', ['build-css']);
    gulp.watch('./src/glsl/**/*.glsl', ['build-shaders']);
});

gulp.task('default', ['start-dev']);