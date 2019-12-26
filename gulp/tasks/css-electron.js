// Update index.html to use built js and css files and use correct base href;
//minify html files
var gulp         = require('gulp');
var useref       = require('gulp-useref');
var htmlreplace  = require('gulp-html-replace');
var browserSync  = require('browser-sync');
var sourcemaps   = require('gulp-sourcemaps');
var lazypipe     = require('lazypipe');
var cleanCSS     = require('gulp-clean-css');
var gulpif       = require('gulp-if');

var utils        = require('../utils');


gulp.task('vendorCSS-electron', function() {
    //concatenate CSS files

    return gulp.src('./src/*.html')
        .pipe(htmlreplace({
            'base': ''
        }))
        .pipe(
            useref(
                {},
                lazypipe().pipe(sourcemaps.init,{loadMaps: true})
            )
        )
        .pipe(gulpif('*.css', cleanCSS()))
        .pipe(utils.env.type === 'dev' ? sourcemaps.write('./') : utils.noop())
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({stream:true}));
});

