const gulp = require('gulp')
const less = require('gulp-less')
const LessAutoprefix = require('less-plugin-autoprefix');
const base64 = require('gulp-base64');
const autoprefix = new LessAutoprefix({ browsers: ['Android >= 3.0', 'Firefox >= 10', 'IOS 6', 'last 3 Explorer versions', 'Opera >= 10'] });
const postcss = require('gulp-postcss');
const px2rem = require('postcss-px2rem');
const browserify = require('browserify')
const babelify = require('babelify')
const browserSync = require('browser-sync').create()
const copy = require('copy')
const reload = browserSync.reload
const fs = require('fs')
const htmlPath = './index.html'
const distPath = './dist'
gulp.task('less', () => {
    return gulp.src('./src/less/*.less')
        .pipe(less({
            plugins: [autoprefix]
        }))
        .pipe(postcss([
            px2rem({
                remUnit: 75
            })
        ]))
        .pipe(base64({
            baseDir: './',
            extensions: ['jpg', 'png', /\.jpg#datauri$/i],
            maxImageSize: 1024 * 20 // 50KB 以下的图片转成base64
        }))
        .pipe(gulp.dest('./dist/css'))
        .pipe(reload({ stream: true }))
})

gulp.task('watch', done => {
    gulp.watch('./src/less/*.less', gulp.series('less'))
    gulp.watch('./src/js/*.js', gulp.series('js', 'reload'))
    gulp.watch('./index.html', gulp.series('html', 'reload'))
    gulp.watch('./src/imgs', gulp.series('imgs', 'reload'))
    done()
})

gulp.task('js', () => {
    let _browserify = browserify({
        debug: true
    })
    _browserify.add('./src/js/main.js')
    return (
            _browserify
            .transform(babelify)
            .bundle()
            .pipe(fs.createWriteStream("./dist/js/app.js"))
                )
})

gulp.task('browserSync', done => {
    browserSync.init({
        server: './dist',
        port: 9000
    })
    done()
})

gulp.task('reload', done => {
    browserSync.reload()
    done()
})

gulp.task('html', done => {
    copy(htmlPath, distPath, done)
})

gulp.task('imgs', done => {
    copy('./src/imgs/*', './dist/imgs', done)
})

gulp.task('default', gulp.series('browserSync', 'less', 'js', 'watch', 'html', 'imgs'))
