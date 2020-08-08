// gulp는 클라이언트 코드를 더 호환 가능한 코드로 변경해주는 webpack을 더 쉽게 사용할 수 있는 방법이다.
// 파일 이름을 gulpfile.bable으로 지으면, gulp가 자동으로 babelrc 파일을 찾은 후
// babel의 설정대로 gulp 파일을 코딩할 수 있게 해준다. (gulpfile.babel.js에서 ES6 문법 사용 가능)
import gulp from "gulp";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import minifyCSS from "gulp-csso";
import del from "del";
import bro from "gulp-bro";
import babel from "babelify";

sass.compiler = require("node-sass");

const paths = {
  // assets/scss에 있는 모든 scss 파일들 중 하나라도 변경된다면, styles.scss를 다시 컴파일한 후
  // 이를 src/static/styles.css로 저장한다.
  styles: {
    src: "assets/scss/styles.scss",
    dest: "src/static/styles",
    watch: "assets/scss/**/*.scss"
  },
  js: {
    src: "assets/js/main.js",
    dest: "src/static/js",
    watch: "assets/js/**/*.js"
  }
};

const clean = () => del(["src/static"]);

const styles = () =>
  gulp
    .src(paths.styles.src)
    .pipe(sass())
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(minifyCSS())
    .pipe(gulp.dest(paths.styles.dest));

const js = () =>
  gulp
    .src(paths.js.src)
    .pipe(
      bro({
        transform: [
          babel.configure({
            presets: ["@babel/preset-env"]
          })
        ]
      })
    )
    .pipe(gulp.dest(paths.js.dest));

const watchFiles = () => {
  gulp.watch(paths.styles.watch, styles);
  gulp.watch(paths.js.watch, js);
};

const dev = gulp.series(clean, styles, js, watchFiles);

export default dev;
