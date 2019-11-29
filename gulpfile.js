const gulp = require('gulp');
const plugin = require('gulp-load-plugins')();

// sourcemap
let sourcemapFlag = false
function sourcemapsInit() {
    return plugin.if(sourcemapFlag, plugin.sourcemaps.init());
}

function sourcemapsWrite() {
    return plugin.if(sourcemapFlag, plugin.sourcemaps.write());
}

// es6 转换
function babel() {
    return plugin.babel({
        'presets': [
            'stage-0', 'env'
        ],
        'plugins': [
            "transform-export-extensions"
        ],
        'comments': false
    });
}

// uglify 压缩
function uglify() {
    return plugin.uglify();
}

// 全局gulp配置
const gulpBase = 'src'

function gulpSrc(src) {
    return gulpBase + (src || '')
}

function gulpDest(src) {
    return 'dist' + (src || '')
}

// 通用任务生成
function runTask() {
    var arg = Array.prototype.slice.call(arguments)
    var src = arg.shift();
    var handle = gulp.src(src, { base: gulpBase })
    // 目录输出
    var build;
    arg.push(gulp.dest(gulpDest()));
    //console.log('src:', src, 'build:', build);
    while (arg.length) {
        handle = handle.pipe(arg.shift());
    }
    return handle;

}

// js 编译压缩
const jsSrc = [gulpSrc('/**/*.js'), '!' + gulpSrc('/**/*.min.js')];
gulp.task('js', function() {
    runTask(
        jsSrc,
        sourcemapsInit(),
        babel(),
        // 压缩
        uglify(),
        sourcemapsWrite()
    )
})

gulp.task('watch', function() {
    gulp.watch(jsSrc, ['js']);
});

// 执行所有任务 , 'html-share' 
gulp.task('build', plugin.sequence(['js']));

//默认
gulp.task('default', function(cb) {
    plugin.sequence(['build'], ['watch'], cb);
});