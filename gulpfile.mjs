import gulp from "gulp";
import pug from "gulp-pug";
import sass from "gulp-dart-sass";
import sourcemaps from "gulp-sourcemaps";
import rename from "gulp-rename";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import uglify from "gulp-uglify";
import plumber from "gulp-plumber";
import imagemin from "gulp-imagemin";
import webp from "gulp-webp";
import avif from "gulp-avif";
import browserSync from "browser-sync";
import gulpif from "gulp-if";
import * as del from "del";
import svgo from "gulp-svgo";
import svgstore from "gulp-svgstore";
import rollup from "@rollup/stream";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import { terser } from "rollup-plugin-terser";

const bs = browserSync.create();
const isProd = process.env.NODE_ENV === "production";

// --- Clear ---
export const clear = () => del.deleteAsync(["dist/**", "!dist"]);

// --- Pug ---
export const html = () =>
  gulp.src("src/pug/*.pug")
  .pipe(plumber())
  .pipe(pug({ pretty: !isProd }))
  .pipe(gulp.dest("dist"))
  .pipe(gulpif(!isProd, bs.stream()));

// --- SCSS ---
export const styles = () =>
  gulp.src("src/scss/style.{sass,scss}")
  .pipe(gulpif(!isProd, sourcemaps.init()))
  .pipe(sass({
    includePaths: ["node_modules"]
  }).on("error", sass.logError))
  .pipe(autoprefixer())
  .pipe(gulpif(isProd, cleanCSS()))
  .pipe(rename({ suffix: ".min" }))
  .pipe(gulpif(!isProd, sourcemaps.write()))
  .pipe(gulp.dest("dist/css"))
  .pipe(gulpif(!isProd, bs.stream()));

// --- JS ---
export const scripts = () => {
  return rollup({
    input: "src/js/main.js",
    output: {
      format: "iife",
      name: "main"
    },
    plugins: [terser()]
  })
  .pipe(source("main.min.js"))
  .pipe(buffer())
  .pipe(gulp.dest("dist/js"))
  .pipe(gulpif(!isProd, bs.stream()));
};

// --- Images (jpg/png/webp/avif) ---
export const imagesOriginal = () =>
  gulp.src("src/images/**/*.{jpg,jpeg,png}")
  .pipe(gulpif(isProd, imagemin()))
  .pipe(gulp.dest("dist/images"));

export const imagesWebp = () =>
  gulp.src("src/images/**/*.{jpg,jpeg,png}")
  .pipe(webp())
  .pipe(gulp.dest("dist/images"));

export const imagesAvif = () =>
  gulp.src("src/images/**/*.{jpg,jpeg,png}")
  .pipe(avif())
  .pipe(gulp.dest("dist/images"));

export const images = gulp.parallel(imagesOriginal, imagesWebp, imagesAvif);

// --- SVG ---
export const svg = () =>
  gulp.src("src/images/**/*.svg")
  .pipe(svgo({
    plugins: [
      { name: "removeViewBox", active: false },
      { name: "cleanupIDs", active: true },
      { name: "removeDimensions", active: true }
    ]
  }))
  .pipe(gulp.dest("dist/images"));

// --- SVG Sprite (опционально) ---
export const svgSprite = () =>
  gulp.src("src/icons/**/*.svg")
  .pipe(svgo())
  .pipe(svgstore({ inlineSvg: true }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("dist/images"));

// --- Fonts ---

export const fonts = () =>
  gulp.src("src/fonts/**/*.{woff,woff2}")
  .pipe(gulp.dest("dist/fonts"));

// --- Server ---
export const serve = () => {
  bs.init({ server: "dist" });
  gulp.watch("src/pug/**/*.pug", html);
  gulp.watch("src/scss/**/*.{scss,sass}", styles);
  gulp.watch("src/js/**/*.js", scripts);
  gulp.watch("src/images/**/*.{jpg,jpeg,png}", images);
  gulp.watch("src/images/**/*.svg", svg);
};

// --- Env setter ---
export const setProdEnv = (cb) => { process.env.NODE_ENV = "production"; cb(); };

// --- Build tasks ---
export const dev = gulp.series(gulp.parallel(html, fonts, styles, scripts, images, svg), serve);
export const build = gulp.series(setProdEnv, clear, gulp.parallel(html, fonts, styles, scripts, images, svg));
