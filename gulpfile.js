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
const watchify = require('watchify');
const envify = require('loose-envify/custom');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

/*** Configuration ***/

const config = {
    app: {
        name: 'AstroFox',
        src: 'src/js/AstroFox.js',
        dest: 'src/browser/build',
        filename: 'app.js'
    },
    vendor: {
        dest: 'src/browser/build',
        filename: 'vendor.js'
    },
    css: {
        src: 'src/css/app.less',
        dest: 'src/browser/build',
        sourcemap: '.'
    },
    icons: {
        src: 'src/svg/icons/*.svg',
        template: 'src/build/templates/icons.css.tpl',
        css: {
            dest: 'resources/css/',
            filename: 'icons.css'
        },
        font: {
            dest: 'resources/fonts/icons/'
        }
    },
    glsl: {
        src: 'src/glsl/**/*.glsl',
        dest: 'src/js/lib/',
        filename: 'ShaderCode.js'
    }
};

const vendorIds = Object.keys(require('./package.json').dependencies);

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

    vendorIds.forEach(id => {
        vendorBundle.require(require.resolve(id), { expose: id });
    });

    vendorBundle.transform(envify({
        _: 'purge',
        NODE_ENV: getEnvironment()
    }), { global:true });

    return build(vendorBundle, config.vendor.filename, config.app.dest);
}

// Builds application only library
function buildApp() {
    vendorIds.forEach(id => {
        appBundle.external(id);
    });

    appBundle.transform(envify({
        _: 'purge',
        NODE_ENV: getEnvironment()
    }), { global:true });

    return build(appBundle, config.app.filename, config.app.dest);
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
        build(appBundle, config.app.filename, config.app.dest);
    });

    return build(appBundle, config.app.filename, config.app.dest);
}

// Compile LESS into CSS
function buildCss() {
    let minify = (getEnvironment() === 'production') ? cleancss : util.noop;

    return gulp.src(config.css.src)
        .pipe(plumber())
        .pipe(less())
        .pipe(minify())
        .pipe(plumber.stop())
        .pipe(gulp.dest(config.css.dest));
}

// Build font library and CSS file
function buildIcons() {
    return gulp.src(config.icons.src)
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

            return gulp.src(config.icons.template)
                .pipe(template({
                    glyphs: icons,
                    fontName: options.fontName,
                    className: 'icon'
                }))
                .pipe(rename(config.icons.css.filename))
                .pipe(gulp.dest(config.icons.css.dest));
        })
        .pipe(gulp.dest(config.icons.font.dest));
}

// Compile GLSL into JS
function buildShaders() {
    return gulp.src(config.glsl.src)
        .pipe(plumber())
        .pipe(glsl({ format: 'object' }))
        .pipe(rename(config.glsl.filename))
        .pipe(plumber.stop())
        .pipe(gulp.dest(config.glsl.dest));
}

// Builds files for deployment
function buildDeploy() {

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

gulp.task('build-shaders', buildShaders);

gulp.task('build-deploy', buildDeploy);

gulp.task('build-all', ['build-vendor', 'build-app', 'build-css', 'build-icons']);

gulp.task('build-dev', ['set-dev', 'build-all']);

gulp.task('build-prod', ['set-prod', 'build-all']);

gulp.task('build-watch', ['set-dev', 'build-css', 'build-shaders', 'build-app-watch'], () => {
    gulp.watch('./src/css/**/*.less', ['build-css']);
    gulp.watch('./src/glsl/**/*.glsl', ['build-shaders']);
});

gulp.task('default', ['build-watch']);