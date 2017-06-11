/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

const del = require('del');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const mergeStream = require('merge-stream');
const polymerBuild = require('polymer-build');
const HtmlSplitter = require('polymer-build').HtmlSplitter;

const swPrecacheConfig = require('./sw-precache-config.js');
const polymerJson = require('./polymer.json');
const polymerProject = new polymerBuild.PolymerProject(polymerJson);
const buildDirectory = 'build';

/**
 * New things
 */
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();


// const SRC = './src/';
const BUILD = './build/';
const IMAGES = './images/';

/**
 * Waits for the given ReadableStream
 */
function waitFor(stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

function build() {
  return new Promise((resolve, reject) => {

    console.log(`Deleting ${buildDirectory} directory...`);

    del([buildDirectory])
      .then(() => {
		const sourcesHtmlSplitter = new HtmlSplitter();
        const sourcesStream = polymerProject.sources()
          .pipe(sourcesHtmlSplitter.split())
          .pipe(gulpif(/\.js$/, babel({
            presets: ['es2015']
          })))
          .pipe(gulpif(/\.js$/, uglify()))
          // .pipe(gulpif(/\.css$/, cssSlam()))
          // .pipe(gulpif(/\.html$/, htmlMinifier()))
          .pipe(gulpif(/\.(png|gif|jpg|svg)$/, imagemin()))
          .pipe(sourcesHtmlSplitter.rejoin());

        const dependeciesHtmlSplitter = new HtmlSplitter();
        const dependenciesStream = polymerProject.dependencies()
          .pipe(dependeciesHtmlSplitter.split())
          .pipe(gulpif(/\.js$/, uglify()))
          // .pipe(gulpif(/\.css$/, cssSlam()))
          // .pipe(gulpif(/\.html$/, htmlMinifier()))
          .pipe(dependeciesHtmlSplitter.rejoin());

        // Okay, now let's merge them into a single build stream
        let buildStream = mergeStream(sourcesStream, dependenciesStream)
          .once('data', () => {
            console.log('Analyzing build dependencies...');
          });

        // If you want bundling, pass the stream to polymerProject.bundler.
        // This will bundle dependencies into your fragments so you can lazy
        // load them.
        buildStream = buildStream.pipe(polymerProject.bundler);

        // Okay, time to pipe to the build directory
        buildStream = buildStream.pipe(gulp.dest(buildDirectory));

        // waitFor the buildStream to complete
        return waitFor(buildStream);
      })
      .then(() => {
        // Okay, now let's generate the Service Worker
        console.log('Generating the Service Worker...');
        return polymerBuild.addServiceWorker({
          project: polymerProject,
          buildRoot: buildDirectory,
          bundled: true,
          swPrecacheConfig: swPrecacheConfig
        });
      })
      .then(() => {
        // You did it!
        console.log('Build complete!');
        resolve();
      });
  });
}

// function serve() {
// 	return new Promise((resolve, reject) => {

// 		console.log('Updating build')
// 		.then(() => {
// 			let sourceStream = polymerProject.sources()
// 				.pipe(polymerProject.splitHtml())
// 				.pipe(gulpif(/\.js$/, babel({
// 					preset: ['es2015']
// 				})))
// 				.pipe(gulpif(/\.js$/, uglify()))
// 				.pipe(gulpif(/\.html$/, htmlMinifier()))
// 				.pipe(gulpif(/\.(png|gif|jpg|svg)$/, imagemin()))
// 				.pipe(polymerProject.rejoinHtml());

// 			let dependenciesStream = polymerProject.dependencies()
// 				.pipe(polymerProject.splitHtml())
// 				.pipe(polymerProject.rejoinHtml());

// 			let buildStream = mergeStream(sourcesStream, dependenciesStream)
// 				.once('data', () => {
// 					console.log('Analyzing build dependencies...');
// 				});

// 			return waitFor(buildStream);
// 		}).
// 		then(() => {
// 			console.log('Update complete');
// 			resolve();
// 		});
// 	});
// }

gulp.task('build', build);

// gulp.task('serve', serve);

gulp.task('scripts', () => {
	console.log('scripts');
	return gulp.src([SRC+'js/**/*.js', '!./node_modules/**', '!./dist/**'])
	// .pipe(jshint('.jshintrc'))
	// .pipe(jshint.reporter(stylish))
		.pipe(babel({
		presets: ['es2015']
		}))
		// .pipe(browserify({
		//   insertGlobals : true
		// }))
		// .pipe(uglify().on('error', gutil.log)) //todo: notify(...) and continue
		.pipe(gulp.dest(BUILD+'src/js'));
});

gulp.task('html', () => {
	console.log('html');
	return gulp.src(SRC+'*.html')
		.pipe(gulp.dest(BUILD));
});

gulp.task('images', () => {
	console.log('images');
	return gulp.src(IMAGES)
		.pipe(imagemin())
		.pipe(gulp.dest(BUILD+'images'));
});


gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: BUILD
    },
    notify: {
      styles: {
        right: 'initial',
        top: 'initial',
        bottom: '0',
        left: '0',
        borderBottomLeftRadius: 'initial',
        borderTopRightRadius: '1em'
      }
    }
  });
});

gulp.task('watch', gulp.series('build', 'browser-sync'), () => {
  gulp.watch(SRC+'js/**/*.js', gulp.series('scripts'));
  gulp.watch(SRC+'*.html', gulp.series('html'));
  gulp.watch(IMAGES+'**/*', gulp.series('images'));
});

