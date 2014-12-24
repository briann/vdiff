var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var nodemon = require('gulp-nodemon');
var notify = require("gulp-notify");
var watch = require('gulp-watch');


var jsFiles = [
    'public/**/*.js',
    'server/**/*.js',
    '*.js'
  ];
var jsTestFiles = [
    'public/**/*_test.js',
    'server/**/*_test.js',
    '*_test.js'
  ];


gulp.task('default', function() {
  // place code for your default task here
});


gulp.task('lint', function() {
  gulp.src(jsFiles)
  .pipe(jshint())
  // Use gulp-notify as jshint reporter
  .pipe(notify(function (file) {
    if (file.jshint.success) {
      // Don't show something if success
      return false;
    }

    var errors = file.jshint.results.map(function (data) {
      if (data.error) {
        return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
      }
    }).join("\n");
    return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
  }));
});


gulp.task('develop', function () {
  nodemon({
    script: 'start.js',
    env: {
      'NODE_ENV': 'development',
      'DEBUG': 'vdiff'
    },
    ext: 'html js'
  })
  .on('change', ['lint'])
  .on('crash', function() {
    gulp.src("gulpfile.js").pipe(notify({
      "title": "SERVER CRASHED",
      "message": "VdiffServer failed to start. Check the logs."
    }));
  });
});


gulp.task('mocha', function() {
  return gulp.src(jsTestFiles, { read: false })
    .pipe(mocha({ reporter: 'list' }))
    .on('error', function(err) {
      gulp.src("gulpfile.js").pipe(notify({
        "title": "MOCHA TESTS FAILED",
        "message": "Check the logs."
      }));
    });
});


gulp.task('watch-mocha', function() {
  gulp.watch(jsTestFiles, ['mocha']);
});
