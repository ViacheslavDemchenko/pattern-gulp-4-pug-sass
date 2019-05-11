const gulp = require('gulp'),
    pug = require('gulp-pug'),
    del = require('del'),
    plumber = require('gulp-plumber'),
    rename = require("gulp-rename"),
    concat = require("gulp-concat"),
    htmlhint = require("gulp-htmlhint"),
    htmlmin = require('gulp-htmlmin'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    gcmq = require('gulp-group-css-media-queries'),
    csso = require('gulp-csso'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    imgmin = require('gulp-tinypng-nokey'),
    svgSprite = require('gulp-svg-sprite'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace'),
    browserSync = require('browser-sync');
    

/* FILES PATHS */

const paths = {
    prod: {
        build: './build'
        },
    html: {
        src: './src/pages/*.pug',
        dest: './build',
        watch: ['./src/pages/*.pug', './src/blocks/**/*.pug']
    },
    css: {
        src: './src/styles/main.scss',
        dest: './build/css',
        watch: ['./src/blocks/**/*.scss', './src/styles/**/*.scss']
    },
    js: {
        src: './src/js/**/*.js',
        dest: './build/js',
        watch: './src/js/**/*.js'
    },
    images: {
        src: ['./src/img/**/*', '!./src/img/*.svg'],
        dest: './build/img',
        watch: ['./src/img/**/*', '!./src/img/*.svg']
    },
    svg: {
        src: './src/img/*.svg',
        dest: './build/img',
        watch: './src/img/*.svg'
    },
    fonts: {
        src: './src/fonts/**/*',
        dest: './build/fonts',
        watch: './src/fonts/**/*'
    }
};
         
/* TASKS */  

/* HTML */ 

gulp.task('html', function() {
    return gulp.src(paths.html.src)
        .pipe(plumber())
        .pipe(pug({
            pretty: true
    }))
        .pipe(htmlhint())
        .pipe(htmlmin({ 
            collapseWhitespace: true 
        }))
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
});

/* CSS */ 
      
gulp.task('styles', function() {
    return gulp.src(paths.css.src)
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['>0.1%'],
            cascade: false
        }))
        .pipe(gcmq())
        .pipe(csso())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest(paths.css.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
});

/* JAVASCRIPT */ 
  
gulp.task('scripts', function() {
    return gulp.src(paths.js.src) 
        .pipe(plumber())
        .pipe(concat('main.js'))
        .pipe(babel({ 
            presets: ['@babel/preset-env']
        }))
        .pipe(uglify({
            mangle: {
                toplevel: true
            }}
        ))
        .pipe(rename('main.min.js')) 
        .pipe(gulp.dest(paths.js.dest)) 
        .pipe(browserSync.reload({
            stream: true
        }));
}); 


/* SPRITES FOR SVG */ 

gulp.task('sprites', function() {
    return gulp.src(paths.svg.src)
        .pipe(plumber())
        .pipe(svgmin({
			js2svg: {
				pretty: true
			}
        }))
        .pipe(cheerio({
			run: function($) {       
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
			},
			parserOptions: { 
                xmlMode: true 
            }
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: '../sprite.svg'
                }
            }
        }
    ))
        .pipe(gulp.dest(paths.svg.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
});

/* IMAGES */ 

gulp.task('imgmin', function() {
    return gulp.src(paths.images.src)
        .pipe(plumber())
        .pipe(imgmin())
        .pipe(gulp.dest(paths.images.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
}); 

/* FONTS */ 
  
gulp.task('fonts', function() {
    return gulp.src(paths.fonts.src)
        .pipe(plumber())
        .pipe(gulp.dest(paths.fonts.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
});

/* BUILD FOLDER ERASE */ 

gulp.task('clean', function() {
    return del(paths.prod.build);
});

/* BROWSER SYNC */ 

gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: paths.prod.build
        },
        reloadOnRestart: true,
        tunnel: 'remote'
    });
    gulp.watch(paths.html.watch, gulp.parallel('html'));
    gulp.watch(paths.css.watch, gulp.parallel('styles'));
    gulp.watch(paths.js.watch, gulp.parallel('scripts'));
    gulp.watch(paths.images.watch, gulp.parallel('imgmin'));
    gulp.watch(paths.images.watch, gulp.parallel('sprites'));
    gulp.watch(paths.fonts.watch, gulp.parallel('fonts'));
}); 

/* PROJECT BUILD */ 

gulp.task('build', gulp.series(
//   'clean',
    'html',
    'styles',
    'scripts',
    'imgmin',
    'sprites',
    'fonts'
));

gulp.task('dev', gulp.series(
    'build', 'server'
));
