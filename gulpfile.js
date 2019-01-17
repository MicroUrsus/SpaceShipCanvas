'use strict';

const gulp       = require('gulp'),              // Подключаем Gulp
    sass         = require('gulp-sass'),         //Подключаем Sass пакет,
    pug          = require('gulp-pug'),          //Подключаем Pug пакет,
    babel        = require('gulp-babel'),
    browserSync  = require('browser-sync').create(),      // Подключаем Browser Sync
    concat       = require('gulp-concat'),       // Подключаем gulp-concat (для конкатенации файлов)
    uglify     = require('gulp-uglifyjs'),     // Подключаем gulp-uglifyjs (для сжатия JS)
    cssnano      = require('gulp-cssnano'),      // Подключаем пакет для минификации CSS
    rename       = require('gulp-rename'),       // Подключаем библиотеку для переименования файлов
    del          = require('del'),               // Подключаем библиотеку для удаления файлов и папок
    imagemin     = require('gulp-imagemin'),     // Подключаем библиотеку для работы с изображениями
    pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache        = require('gulp-cache'),        // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов

const path = 	{

    build: 	{
        server: 'build/',
        html  : 'build/',
        php   : 'build/',
        js	  : 'build/js/',
        jsVen : 'build/js/vendor',
        css	  : 'build/css/'
    },
    source: 	{
        html : 'source/**/*.html',
        php  : 'source/**/*.php',
        pug	 : 'source/pug/index.pug',
        js	 : 'source/js/*.js',
        jsVen: 'source/js/vendor/*.js',
        scss : 'source/scss/**/*.scss',
        css	 : 'source/scss/**/*.css'
    },
    watch: 	{
        php	: 'source/**/*.php',
        pug	: 'source/pug/**/*.pug',
        js	: 'source/js/*.js',
        jsVen: 'build/js/vendor/*.js',
        scss: 'source/scss/**/*.scss'
    },
    clean	: './build'
};

function scss() {
    return gulp.src('source/scss/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(['last 15 versions', '> 0.1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        //.pipe(cssnano())
        //.pipe(concat('main.css'))
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.stream());
}

function pughtml() {
    return gulp.src(path.source.pug)
        .pipe(pug({
            pretty: true
        }))
        /*.pipe(rename(function (path) {
            path.extname = ".php";
        }))*/
        .on('error', console.log)
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.stream());
}

function php() {
    return gulp.src(path.source.php)
        .pipe(gulp.dest(path.build.php))
        .pipe(browserSync.stream());
}

function html() {
    return gulp.src(path.source.html)
        .pipe(gulp.dest(path.build.html));
        //.pipe(browserSync.stream());
}

function jsVen() {
    return gulp.src(path.source.jsVen)
        .pipe(gulp.dest(path.build.jsVen))
        .pipe(browserSync.stream());
}

function jscript() {
    return gulp.src(path.source.js)
        //.pipe(babel({
        //    presets: ['@babel/env']
        //}))
        //.pipe(uglify())
        //.pipe(concat('main.js'))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
}

function brow_sync() {
    browserSync.init({
        server: {
            baseDir: path.build.server,
            port   : 8080,
            open   : true
        },
        notify: false
    });
    browserSync.watch('build'.browserSync.reload);

}

function clean() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
}
function clear_cach() {
    return cache.clearAll();
}


function watch() {
    browserSync.init({
        server: {
            baseDir: path.build.server,
            port   : 8080,
            open   : true
        },
        notify: false
    });

    gulp.watch(path.watch.scss, gulp.series(scss));
    gulp.watch(path.watch.pug, gulp.series(pughtml));
    gulp.watch(path.watch.php, gulp.series(php));
    gulp.watch(path.watch.jsVen, gulp.series(jsVen));
    gulp.watch(path.watch.js, gulp.series(jscript));
}


gulp.task('scss', scss);
gulp.task('pughtml', pughtml);
gulp.task('php', php);
//gulp.task('html', html);
gulp.task('jscript', jscript);
gulp.task('jsven', jsVen);
//gulp.task('brow_sync', brow_sync);

//gulp.task('clean', clean);
//gulp.task('clear:cache', clear_cach);


let build = gulp.series (
    gulp.parallel(
        scss,
        pughtml,
        php,
        jsVen,
        jscript,
    )
);

gulp.task('build', build);

//gulp.task('watch', gulp.series(scss, pughtml, php, jscript, watch));
/*gulp.task('watch', gulp.series(
    gulp.parallel(scss, pughtml, php, jscript),
    gulp.parallel(watch, serve)
    ));*/



gulp.task('default', gulp.series(build, watch));