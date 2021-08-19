const { src, dest, gulp, parallel, series, watch } = require('gulp');
const fs = require('fs');

// =========================== FOLDERS NAMES ========= 

const project_folder    = require("path").basename(__dirname);
const source_folder     = "app";

// =========================== FOLDERS PATHS ========= 

const path = {
    build: {
        html    : project_folder + "/",
        css     : project_folder + "/css/",
        js      : project_folder + "/js/",
        img     : project_folder + "/img/",
        fonts   : project_folder + "/fonts/"
    },
    src: {
        html    : [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css     : source_folder + "/scss/style.scss",
        js      : source_folder + "/js/script.js",
        img     : source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts   : source_folder + "/fonts/*.ttf"
    },
    watch: {
        html    : source_folder + "**/*.html",
        css     : source_folder + "/scss/**/*.scss",
        js      : source_folder + "/js/**/*.js",
        img     : source_folder + "/img/**/*.{jpg,png,svg,fig,ico,webp}"
    },
    clean: "./" + project_folder + "/"
}

// =========================== GULP'S PACKETS ========= 

const browserSync   = require('browser-sync').create();
const sass          = require('gulp-sass');
const autoprefixer  = require('gulp-autoprefixer');
const del           = require('del');
const group_media   = require('gulp-group-css-media-queries');
const cleancss      = require('gulp-clean-css');
const rename        = require('gulp-rename');
const fileinclude   = require('gulp-file-include');
const uglify        = require('gulp-uglify-es').default;
const imagemin      = require('gulp-imagemin');
const webp          = require('gulp-webp');
const webphtml      = require('gulp-webp-html');
const webpcss       = require('gulp-webp-css');
const ttf2woff      = require("gulp-ttf2woff");
const fonter        = require("gulp-fonter");

// =========================== GULP FUNCTIONS ========= 

function browsersync() {
    browserSync.init({
        server: { 
            baseDir: "./" + project_folder + "/" 
        },
        port: 3000,
        notify: false,
        online: true
    });
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(
            sass({
                outputStyle: "expanded"
            })
        )
        .pipe(
            group_media()
        )
        .pipe(
            autoprefixer({
                overrideBrowserlist: ["last 5 versions"],
                cascade: true
            })
        )
        .pipe(webpcss())
        .pipe(dest(path.build.css))
        .pipe(cleancss())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream());
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browserSync.stream())
}

function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3        // 0 - 7
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browserSync.stream())
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
}

function fontsStyle() {
    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (let i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}

function cb() {}

function watchFiles() {
    watch([path.watch.html], {usePolling: true}, html);
    watch([path.watch.css], {usePolling: true}, css);
    watch([path.watch.js], {usePolling: true}, js);
    watch([path.watch.img], {usePolling: true}, images);
}

function clean() {
    return del(path.clean);
}

// =========================== GULP TASKS =========

const build         = series(clean, parallel(js, css, html, images, fonts), fontsStyle);
const watcher       = parallel(build, watchFiles, browsersync);

exports.fontsStyle  = fontsStyle;
exports.fonts       = fonts;
exports.images      = images;
exports.js          = js;
exports.css         = css;
exports.html        = html;
exports.build       = build;
exports.watcher     = watcher;
exports.default     = watcher;