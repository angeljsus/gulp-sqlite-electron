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
const webp = require('webp-converter');
const path = require('path');
const tap = require('gulp-tap');
webp.grant_permission();
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
    output: OUTPUT_DIR+'/images/',
    procces: DEV_DIR+'/images/catch/',
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



task('build:images', function(){
  let file = '';
  return src(config.images.watch)
  .pipe(plumber())
  .pipe(imagemin())
  .pipe(tap(function(file) {
    file = path.basename(file.path).split('.');
    if (file.length == 2) {
      if (file[1] == 'gif') {
        webp.gwebp(DEV_DIR+'/images/'+file[0]+'.'+file[1],config.images.output+file[0]+'.webp')
      } else {
        webp.cwebp(DEV_DIR+'/images/'+file[0]+'.'+file[1],config.images.output+file[0]+'.webp','-q 60')
      }
      console.log('Convertida: ' + file[0] + '.webp')
    }
  }))
})


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