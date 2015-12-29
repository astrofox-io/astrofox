var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var duration = require('gulp-duration');
var exit = require('gulp-exit');
var iconfont = require('gulp-iconfont');
var less = require('gulp-less');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var strip = require('gulp-strip-comments');
var template = require('gulp-template');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var spritesmith = require('gulp.spritesmith');

var browserify = require('browserify');
var glslify = require('glslify');
var babelify = require('babelify');
var watchify = require('watchify');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var nodeResolve = require('resolve');

var _ = require('lodash');

var production = false;

/*** Functions ***/

var bundler = browserify({
    entries: './src/js/AstroFox.js',
    transform: [babelify, glslify],
    extensions: ['.js', '.jsx'],
    paths: ['./node_modules', './src/js/'],
    noParse: ['lodash','three'],
    standalone: 'AstroFox',
    ignoreMissing: false,
    detectGlobals: false,
    cache: {},
    packageCache: {}
});

function bundle() {
    var timer = duration('bundle time');

    return bundler.bundle()
        .on('error', function(err){
            util.log(util.colors.red(err.message));
        })
        .pipe(timer)
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./build'));
}

function getNPMPackageIds() {
    var manifest = require('./package.json');

    return _.keys(manifest.dependencies) || [];
}

/*** Tasks ***/

// Builds application
gulp.task('build', function() {
    return bundle();
});

// Builds application and watches for changes
gulp.task('build-watch', function() {
    bundler = watchify(bundler)
        .on('update', function(ids) {
            util.log(ids);
            bundle();
        });

    return bundle();
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
            var icons = glyphs.map(function(glyph) {
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

// Build sprite sheet
gulp.task('build-sprite', function() {
    var spriteData = gulp.src('./src/images/sprite/*.png')
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.css',
            cssTemplate: 'src/images/sprite/template/sprite.css.mustache'
        }));

    spriteData.pipe(gulp.dest('build'));
});

// Builds separate vendor library
gulp.task('build-vendor', function() {
    var b = browserify({
        debug: false
    });

    ['react','lodash','three','mime'].forEach(function (id) {
        b.require(nodeResolve.sync(id), { expose: id });
    });

    return b.bundle()
        .pipe(source('vendor.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./build'));
});

// Builds application only library
gulp.task('build-app', function() {
    getNPMPackageIds().forEach(function (id) {
        bundler.external(id);
    });

    compile(false);
});

gulp.task('watch', ['build-watch', 'build-css'], function() {
    gulp.watch('./src/css/**/*.*', ['build-css']);
    //gulp.watch('./src/js/**/*.*', ['build-watch']);
});

gulp.task('default', ['watch']);