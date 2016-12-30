var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

function handleError(err) {
  console.log(err.message);
  this.emit('end');
}

gulp.task('build', () => {
  return browserify({
    extensions: ['.js'],
    entries: ['src/game.js'],
    debug: true
  })
  .on('error', handleError)
  .transform(babelify, { presets: ['es2015'] })
  .on('error', handleError)
  .bundle()
  .on('error', handleError)
  .pipe(source('simulacrum.js'))
  .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch(['src/**/*.js'], ['build']);
});

gulp.task('default', ['build', 'watch']);
