var gulp  = require('gulp')
var shell = require('gulp-shell')
var args = require('../args');
var runSequence = require('run-sequence');


gulp.task('reinstallJspmLink', shell.task([
  'jspm link ' + args.localLinkName +' -y'
]));

gulp.task('updateJspmLocalLink', function(callback) {
  return runSequence('build','reinstallJspmLink',callback );
});