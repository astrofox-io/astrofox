var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');
var minifycss = require('gulp-minify-css');
var react = require('gulp-react');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var spritesmith = require('gulp.spritesmith');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');

gulp.task('browserify', function(){
    return browserify({ entries: './src/js/AstroFox.js', transform: [reactify], standalone: 'AstroFox' })
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('react', function(){
    return gulp.src('src/jsx/**/*.jsx')
        .pipe(react())
        .pipe(concat('ui.js'))
        .pipe(gulp.dest('build'))
});

gulp.task('less', function(){
    return gulp.src('src/css/app.less')
        .pipe(less())
        .pipe(gulp.dest('build'));
});

gulp.task('sprite', function () {
    var spriteData = gulp.src('src/image/sprite/*.png')
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.css',
            cssTemplate: 'src/image/sprite/template/sprite.css.mustache'
        }));

    spriteData.pipe(gulp.dest('build'));
});

gulp.task('compile', function(){
    return gulp.src('src/css/app.less')
        .pipe(less())
        .pipe(concat('main.css'))
        .pipe(minifycss())
        .pipe(gulp.dest('css'));
});

gulp.task('watch', ['less','browserify'], function(){
    gulp.watch('src/css/**/*.less', ['less']);
    gulp.watch('src/js/**/*.*', ['browserify']);
});

gulp.task('default', ['less','sprite','react','browserify']);