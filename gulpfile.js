const gulp = require('gulp');

// utility
const plumber = require('gulp-plumber'); //エラー発生時の強制終了を防止する
const notify = require('gulp-notify'); //エラー発生時にデスクトップ上に通知する
const browserSync = require('browser-sync'); // browser-syncの読み込み
const gulpif = require('gulp-if'); //gulpで条件分岐
const rename = require('gulp-rename'); //拡張子変更用

// js minify
const uglify = require('gulp-uglify');
// HTML
const prettify = require('gulp-prettify');

// css(sass)
const sass = require('gulp-sass');  //scssコンパイルをするのに必要
const sassGlob = require('gulp-sass-glob'); //@importの記述を簡潔にする
const autoprefixer = require('autoprefixer'); //ベンダープレフィックス付与
const postcss = require('gulp-postcss'); //autoprefixerとセット
const cleanCSS = require('gulp-clean-css'); //CSSをminifyする
const flexBugsFixes = require('postcss-flexbugs-fixes'); //

// 画像圧縮
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');

// 参照先ディレクトリ
const paths = {
   root:'./src',
   html: {
      src:'./src/**/*.html',
      dest:'./dist/',
   },
   images: {
      src:'./src/images/*.{png,jpg,svg,gif}',
      dest:'./dist/images',
   },
   scss: {
      src:'./src/scss/**/*.scss',
      dest:'./dist/css',
      map:'./dist/css/map',
   },
   js: {
      src:'./src/js/**/*.js',
      dest:'./dist/js',
      map:'./dist/js/map',
   },
   ejs: {
      src:'./src/ejs/**/*.ejs',
      dest:'./dist/ejs',
   },
};
// ejs


// HTML整形
function html() {
  return gulp
    .src(paths.html.src, { since: gulp.lastRun(html) })
    .pipe(
      prettify({
        indent_char: ' ',
        indent_size: 4,
        unformatted: ['a', 'span', 'br'],
      }),
    )
    .pipe(gulp.dest(paths.html.dest));
}

// scssコンパイルタスク　非圧縮
function scssStyles()　{
   const plugins = [
      flexBugsFixes(),
      autoprefixer({
         grid: 'autoplace',
          // ☆IEは11以上、Androidは4.4以上
          // その他は最新2バージョンで必要なベンダープレフィックスを付与する
         "overrideBrowserslist": ["last 2 versions", "ie >= 11", "Android >= 4"],cascade: false,
      })
   ];
   return gulp
      .src(paths.scss.src,{ sourcemaps: true })
      .pipe(
         plumber({errorHandler: notify.onError("Error: <%= error.message %>")}) //エラーチェック
      )
      .pipe(
         sass({
           outputStyle: 'expanded',
         }),
      )
      // globパターンでのインポート機能を追加
      .pipe(sassGlob())
      .pipe(postcss(plugins))
      .pipe(
         cleanCSS({
            format: 'beautify', // 圧縮せずに整形して出力する
            compatibility: {
               properties: {zeroUnits: false}, // 0の単位を不必要な場合は削除する
            },
         })
      )
      .pipe(gulp.dest(paths.scss.dest), { sourcemaps: './maps' });
}

// js自動圧縮
function js() {
   return gulp
   .src(paths.js.src,{ sourcemaps: true })
   .pipe(
      plumber({errorHandler: notify.onError("Error: <%= error.message %>")}) //エラーチェック
   )
   .pipe(uglify()
      .on('error',function(e) {
         console.log(e);
      }))
   .pipe(rename({suffix: '.min'}))
   .pipe(gulp.dest(paths.js.dest), { sourcemaps: './maps' });
}

// 画像ファイルの最適化
const imageminOption = [
  pngquant({
    quality: [0.7, 0.85],
  }),
  mozjpeg({
    quality: 85,
  }),
  imagemin.gifsicle(),
  imagemin.optipng(),
  imagemin.svgo({
    removeViewBox: false,
  }),
];
function images() {
   return gulp
   .src(paths.images.src, {
      since: gulp.lastRun(images),
   })
   .pipe(plumber())
   .pipe(imagemin(imageminOption))
   .pipe(gulp.dest(paths.images.dest));
}

// ブラウザ更新 & ウォッチタスク
const browserSyncOption = {
   port: 8080,
   server: {
      baseDir: paths.html.dest,
      index: 'index.html',
   },
   reloadOnRestart: true,
};

function serve(done) {
   browserSync.init(browserSyncOption);
   done();
}

function watchFiles(done) {
  const browserReload = () => {
    browserSync.reload();
    done();
  };
  gulp.watch(paths.scss.src).on('change', gulp.series(scssStyles, browserReload));
  gulp.watch(paths.html.src).on('change', gulp.series(html, browserReload));
  gulp.watch(paths.js.src).on('change', gulp.series(js, browserReload));
}


gulp.task('default',
   gulp.series(gulp.parallel(scssStyles, html, js),gulp.series(serve, watchFiles))
);

gulp.task(images);
gulp.task(scssStyles);
gulp.task(js);
