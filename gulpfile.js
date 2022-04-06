const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const gutil = require('gulp-util');
const serve = require('gulp-serve');
const tsify = require('tsify');

const b = browserify({
    entries: './app/frontend/main.ts', // Only need initial file, browserify finds the deps
    debug: true,
    paths: [
        './app/frontend/backend',
        './app/frontend/components',
        './app/frontend/screens',
        './app/frontend/test-screen',
    ],
    insertGlobalconsts: { // global inherits function
        inherits: function(file, dir) {
            return 'require("inherits")';
        }
    }
}).plugin(tsify, { target: 'ES2016' });
// browserify for node style requires
gulp.task('browserify', function() {
    return b.bundle()
        .on('error', function (err){
            gutil.log(gutil.colors.bgRed(err));
            gutil.beep();
            // end this stream
            this.emit('end');
        })
        .pipe(source('regio-vinco.js'))
        .pipe(sourcemaps.write())
        .pipe(buffer())

    .pipe(gulp.dest('./app/public/js/'))
});

// update scripts on change
gulp.task('scripts:watch', function() {
    gulp.watch(['./app/frontend/**/*.ts'], gulp.series('browserify'));
});

gulp.task('default', gulp.series('browserify', 'scripts:watch'));
gulp.task('deploy', gulp.series('browserify'));
