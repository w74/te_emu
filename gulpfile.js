var gulp = require('gulp'),
		babel = require('gulp-babel'),
		rename = require('gulp-rename'),
		uglify = require('gulp-uglify');

gulp.task('js', () => {
	return gulp.src('dev/te_emu.dev.js')
		.pipe(babel({presets: ['es2015'],}))
		.pipe(rename('te_emu.js'))
		.pipe(gulp.dest('dev'));
});

gulp.task('push', () => {
	return gulp.src('dev/te_emu.js')
		.pipe(rename('te_emu.js'))
		.pipe(gulp.dest('dist'))
		.pipe(uglify())
		.pipe(rename('te_emu.min.js'))
		.pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
	gulp.watch('dev/te_emu.dev.js', ['js']);
});