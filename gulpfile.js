var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var less = require('gulp-less');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var strip = require('gulp-strip-comments');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var spritesmith = require('gulp.spritesmith');
var browserify = require('browserify');
var glslify = require('glslify');
var babelify = require('babelify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var b = browserify({
    entries: './src/js/AstroFox.js',
    transform: [babelify, glslify],
    extensions: ['.js', '.jsx'],
    paths: ['./node_modules', './src/js/'],
    noParse: ['lodash','three'],
    standalone: 'AstroFox',
    cache: {},
    packageCache: {}
});

var w = watchify(b)
    .on('update', function(ids) {
        util.log(ids);
        bundle();
    });

function bundle() {
    return w.bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(gulp.dest('build'));
}

gulp.task('browserify', function() {
    return b.bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('watchify', function() {
    return bundle();
});

gulp.task('less', function() {
    return gulp.src('src/css/app.less')
        .pipe(less())
        .pipe(minifycss())
        .pipe(gulp.dest('build'));
});

gulp.task('sprite', function() {
    var spriteData = gulp.src('src/images/sprite/*.png')
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.css',
            cssTemplate: 'src/images/sprite/template/sprite.css.mustache'
        }));

    spriteData.pipe(gulp.dest('build'));
});

gulp.task('watch', ['less','watchify'], function() {
    gulp.watch('src/css/**/*.*', ['less']);
    gulp.watch('src/js/**/*.*', ['watchify']);
});

gulp.task('default', ['less','sprite','browserify']);