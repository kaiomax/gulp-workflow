var gulp = require('gulp'),
	runSequence = require('run-sequence'),
	$ = require('gulp-load-plugins')();

var config = {
	bowerDir: './bower_components'
}

// Install Bower packages
gulp.task('bower', function() {
	return $.bower()
		.pipe(gulp.dest(config.bowerDir))
});

/* HTML Tasks
 ============================= */

gulp.task('jade', function() {
	return gulp.src('src/templates/**/*.jade')
		.pipe($.jade({
			pretty: true
		}))
		.pipe(gulp.dest('build'))
		.pipe($.connect.reload());
});


/* CSS Tasks
 ============================= */

// Preprocess Sass
gulp.task('sass', function() {
	return gulp.src('src/sass/main.scss')
		.pipe($.sass({
			imagePath: 'build/files/images',
			includePaths: [
				config.bowerDir + '/bourbon/app/assets/stylesheets',
				config.bowerDir + '/neat/app/assets/stylesheets',
				config.bowerDir + '/fontawesome/scss'
			]
		}))
		.pipe(gulp.dest('build/css'))
		.pipe($.connect.reload());
});

// Minify the main.css file
gulp.task('minify-css', function(){
	return gulp.src('build/css/main.css')
		.pipe($.minifyCss({
			keepSpecialComments : 0
		}))
		.pipe($.rename({suffix: '.min'}))
		.pipe(gulp.dest('build/css'));
});

gulp.task('styles', function(){
	runSequence('sass', 'minify-css');
});


/* JS Tasks
 ============================= */

// Concatenate scripts in a proper order
gulp.task('concat', function(){
	return gulp.src([
			'src/js/jquery.js',
			'src/js/vendor/*.js',
			'src/js/main.js'
		])
		.pipe($.concat('main.js'))
		.pipe(gulp.dest('build/js'))
		.pipe($.connect.reload());
});

// Uglify the script concatenated
gulp.task('uglify', function(){
	return gulp.src('build/js/main.js')
		.pipe($.uglify({ mangle : false }))
		.pipe($.rename({suffix: '.min'}))
		.pipe(gulp.dest('build/js'));
});

gulp.task('scripts', function(){
	runSequence('concat', 'uglify');
});


/* FILES Tasks
 ============================= */

// Minify images
gulp.task('images', function(){
	var dest = "build/files/images";

	return gulp.src('src/files/images/**')
		.pipe($.changed(dest))
		.pipe($.imagemin())
		.pipe(gulp.dest(dest))
		.pipe($.connect.reload());
});

// Copy fonts do the relative build directory
gulp.task('copy-fonts', function(){
	return gulp.src(config.bowerDir + '/fontawesome/fonts/**.*')
		.pipe(gulp.dest('build/files/fonts'));
});

// Clean the build directory
gulp.task('clean', function(){
	return gulp.src('build', {read: false})
		.pipe($.clean());
});


/* SERVER Tasks
 ============================= */

// Init the server and activate livereload
gulp.task('connect', function(){
	$.connect.server({
		root: 'build',
		livereload: true
	});
});


/* GULP Tasks
 ============================= */

gulp.task('watch', function(){
	gulp.watch('src/templates/**/*.jade', ['jade']);
	gulp.watch('src/sass/**/*.scss', ['styles']);
	gulp.watch('src/js/**/*.js', ['scripts']);
	gulp.watch('src/files/images/**', ['images']);
});

gulp.task('general', ['jade','styles','scripts','images','copy-fonts']);

// Using runSequence to clean the build directory before start the general tasks that runs asynchronously
gulp.task('build', function(){
	runSequence('clean', 'general');
});

gulp.task('default', ['bower', 'build', 'watch', 'connect']);
