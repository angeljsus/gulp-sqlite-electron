'use strict';
const { task, src, dest, watch, series } = require('gulp');
const stylus = require('gulp-stylus');
const minifyCSS = require('gulp-minify-css');
const nib = require('nib');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');

let DEV_DIR = 'DEV';
let OUTPUT_DIR = 'BUILD';

let config = {
  styles: {
    main: DEV_DIR+'/styles/*.styl',
    watch: DEV_DIR+'/styles/**/*.styl',
    output: OUTPUT_DIR+'/styles/'
  },
  js: {
    watch: DEV_DIR+'/js/*.js',
    output: OUTPUT_DIR+'/js/'
  },
  images: {
    watch: DEV_DIR+'/images/**/*',
    output: OUTPUT_DIR+'/images/'
  },
};

task('build:css', function(cb) {
  return src(config.styles.main)
  .pipe(stylus({
    use: nib(),
    import: ['nib'],
    'include css': true
  }))
  .pipe(minifyCSS())
  .pipe(concat('index.css'))
  .pipe(dest(config.styles.output))
  .on('error', onError);
});

task('build:js',function(){
  return src(config.js.watch)
  .pipe(babel({
    presets: ['@babel/preset-env']
  }))
  .pipe(concat('index.js'))
  .pipe(uglify())
  .pipe(dest(config.js.output))
  .on('error', onError);
});

task('build:images',function(){
  return src(config.images.watch) 
  .pipe(plumber())
  .pipe(imagemin())
  .pipe(webp())    
  .pipe(dest(config.images.output))
  .on('error', onError);
});

task('build:html',function(){
  return src(DEV_DIR+'/*.html') 
  .pipe(dest(OUTPUT_DIR))
  .on('error', onError);
})

task('watch:changes',function(){
  watch(config.styles.watch, series('build:css'));
  watch(config.js.watch, series('build:js'));
  watch(config.images.watch, series('build:images'));
  watch(DEV_DIR+'/*.html', series('build:html'));
});

task('default',series('build:html','build:css','build:js','build:images', 'watch:changes'));

function onError(err){
  console.log(err);
  this.emit('end');
} 