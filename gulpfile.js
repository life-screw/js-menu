const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssSorter = require("css-declaration-sorter");
const mmq = require("gulp-merge-media-queries");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const imagemin = require("gulp-imagemin");

// const browserSync = require("browser-sync");
const browserSync = require("browser-sync").create();


const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");

// HTML整形
// const htmlBeautify = require("gulp-html-beautify");
// const prettier = require("gulp-prettier"); // prettierの方を採用

// エラー通知
// SassやJSでエラーが出るとwatchが止まる問題を回避し、デスクトップ通知で気付きやすく。
function onError(err) {
  notify.onError({
    title: "Gulp error in " + err.plugin,
    message: err.toString(),
  })(err);
  this.emit("end");
}

function test(done) {
  console.log("Hello Gulp");
  done();
}

function compileSass() {
  return (
    gulp
      .src("src/scss/*.scss") // ← すべてのエントリーポイント
      // .pipe(plumber({ errorHandler: onError })) // エラーで止まらないようにplumber を適用
      .pipe(sass().on("error", sass.logError))
      .pipe(postcss([autoprefixer(), cssSorter()]))
      .pipe(mmq())
      .pipe(gulp.dest("./dist/css")) // dist/cssへ出力
      .pipe(browserSync.stream())
  ); // CSSは差し替えだけでリロード不要
}

function watch() {
  gulp.watch(
    [
      "src/scss/Page/**/*.scss",
      "src/scss/Module/**/*.scss",
      "src/scss/Foundation/*.scss",
      "src/scss/Setting/*.scss",
      "!src/scss/**/_index.scss",
    ],
    generateCommonIndex,
  );
  gulp.watch("src/scss/**/*.scss", gulp.series(compileSass));
  gulp.watch("./src/js/**/*.js", gulp.series(bundleJS, browserReload));
  gulp.watch("./**/*.html").on("change", browserSync.reload);
  gulp.watch("./dist/js/**/*.js").on("change", browserSync.reload);
  gulp.watch("./src/img/**/*", copyImage);
}

function bundleJS() {
  // src/js直下の.jsファイルを動的に取得
  const jsFiles = fs
    .readdirSync("./src/js")
    .filter(
      (file) =>
        file.endsWith(".js") && fs.statSync(`./src/js/${file}`).isFile(),
    );

  // entryオブジェクトを動的に生成
  const entries = {};
  jsFiles.forEach((file) => {
    const name = file.replace(".js", "");
    entries[name] = `./src/js/${file}`;
  });

  return gulp
    .src(
      jsFiles.map((file) => `./src/js/${file}`),
      {
        allowEmpty: true,
      },
    )
    .pipe(plumber({ errorHandler: onError }))
    .pipe(
      webpackStream(
        {
          mode: "production", // production（圧縮）、development（圧縮無効）
          // devtool: "source-map", // ソースマップを生成
          entry: entries, // 動的に生成したエントリー
          output: {
            filename: "[name].js", // => [ファイル名].js に出力
          },
          module: {
            rules: [
              {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                  loader: "babel-loader",
                  options: {
                    presets: ["@babel/preset-env"],
                  },
                },
              },
              {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
              },
            ],
          },
        },
        webpack,
      ),
    )
    .pipe(gulp.dest("./dist/js/"))
    .pipe(browserSync.stream());
}

function browserInit(done) {
  browserSync.init({
    server: {
      baseDir: "./",
    },
    notify: false,
  });
  done();
}

function browserReload(done) {
  browserSync.reload();
  done();
}

// function minJS() {
//   return gulp
//     .src("./src/js/**/*.js")
//     .pipe(plumber({ errorHandler: onError })) // エラーで止まらないようにplumber を適用
//     .pipe(uglify())
//     .pipe(
//       rename({
//         suffix: ".min",
//       })
//     )
//     .pipe(gulp.dest("../js/"));
// }

// function formatHTML() {
//   return gulp
//     .src("./src/**/*.html")
//     .pipe(
//       htmlBeautify({
//         indent_size: 2,
//         indent_with_tabs: true,
//       })
//     )
//     .pipe(gulp.dest("./dist"));
// }

// 画像処理：imagemin を追加
function copyImage() {
  return gulp
    .src("./src/img/**/*")
    .pipe(imagemin())
    .pipe(gulp.dest("./dist/img/"));
}

// Page配下、Module配下（Component、Layout、Utility含む）、Foundation配下、Setting配下すべてのフォルダで _index.scss 自動生成
function generateCommonIndex(done) {
  const baseDirs = [
    "src/scss/Page",
    "src/scss/Module",
    "src/scss/Component",
    "src/scss/Layout", // Layout追加
    "src/scss/Utility", // Utility追加
  ];

  const walkDirs = (dirPath) => {
    const absolutePath = path.resolve(dirPath);
    console.log(`\n=== ディレクトリ処理開始 ===`);
    console.log(`相対パス: ${dirPath}`);
    console.log(`絶対パス: ${absolutePath}`);
    console.log(`存在確認: ${fs.existsSync(absolutePath)}`);

    // ディレクトリが存在しない場合はスキップ
    if (!fs.existsSync(absolutePath)) {
      console.log(`❌ ディレクトリが存在しません: ${dirPath}`);
      return;
    }

    try {
      const items = fs.readdirSync(absolutePath, { withFileTypes: true });
      console.log(`📁 ${dirPath} 内のアイテム数: ${items.length}`);

      // すべてのアイテムをログ出力
      items.forEach((item, index) => {
        console.log(
          `  ${index + 1}. ${item.name} (${
            item.isFile() ? "ファイル" : "ディレクトリ"
          })`,
        );
      });

      // SCSSファイルを抽出
      const scssItems = items.filter(
        (item) =>
          item.isFile() &&
          item.name.endsWith(".scss") &&
          item.name !== "_index.scss",
      );

      console.log(`📝 対象SCSSファイル:`);
      scssItems.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name}`);
      });

      const scssFiles = scssItems.map(
        (item) => `@use "./${item.name.replace(".scss", "")}";`,
      );

      // _index.scssを作成
      if (scssFiles.length > 0) {
        const indexPath = path.join(absolutePath, "_index.scss");
        const imports = scssFiles.join("\n");

        console.log(`📄 生成される内容:\n${imports}`);

        let shouldWrite = true;
        if (fs.existsSync(indexPath)) {
          const existingContent = fs.readFileSync(indexPath, "utf8");
          shouldWrite = existingContent !== imports;
          console.log(
            `既存ファイル: ${shouldWrite ? "内容が異なる" : "内容が同じ"}`,
          );
        } else {
          console.log(`新規ファイル作成`);
        }

        if (shouldWrite) {
          fs.writeFileSync(indexPath, imports);
          console.log(`✅ _index.scss を書き込みました: ${indexPath}`);
        } else {
          console.log(`⭐ _index.scss は最新です: ${indexPath}`);
        }
      } else {
        console.log(`📭 対象SCSSファイルなし`);

        // SCSSファイルがない場合、空の_index.scssを作成
        const indexPath = path.join(absolutePath, "_index.scss");
        if (!fs.existsSync(indexPath)) {
          fs.writeFileSync(
            indexPath,
            "// 自動生成されたファイル\n// このディレクトリにSCSSファイルがありません",
          );
          console.log(`📝 空の _index.scss を作成しました: ${indexPath}`);
        }
      }

      // サブディレクトリを処理
      const subDirs = items.filter((item) => item.isDirectory());
      console.log(`📂 サブディレクトリ数: ${subDirs.length}`);

      subDirs.forEach((dir) => {
        console.log(`🔄 サブディレクトリ処理: ${dir.name}`);
        walkDirs(path.join(dirPath, dir.name));
      });
    } catch (error) {
      console.error(`❌ エラーが発生しました: ${dirPath}`, error);
    }

    console.log(`=== ディレクトリ処理終了: ${dirPath} ===\n`);
  };

  console.log("🚀 _index.scss 自動生成を開始...");
  console.log(`現在の作業ディレクトリ: ${process.cwd()}`);

  baseDirs.forEach((baseDir) => {
    console.log(`\n📂 ベースディレクトリ処理開始: ${baseDir}`);
    walkDirs(baseDir);
    console.log(`✅ ベースディレクトリ処理完了: ${baseDir}`);
  });

  console.log("\n✨ _index.scss の自動生成が完了しました");
  done();
}

exports.test = test;
exports.compileSass = compileSass;
exports.watch = watch;
exports.browserInit = browserInit;
exports.dev = gulp.parallel(browserInit, watch);
// exports.minJS = minJS;
exports.copyImage = copyImage;
exports.bundleJS = bundleJS;
// exports.formatHTML = formatHTML;
// exports.build = gulp.parallel(formatHTML, minJS, compileSass, copyImage, generateCommonIndex);
exports.build = gulp.parallel(
  bundleJS,
  compileSass,
  copyImage,
  generateCommonIndex,
);
