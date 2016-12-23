var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var bowerFiles = require('main-bower-files');
var print = require('gulp-print');
var Q = require('q');
var gutil = require('gulp-util');
var ngannotate = require('gulp-ng-annotate');
var browserSync = require('browser-sync');
var autoPrefixBrowserList = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];
var BROWSER_SYNC_RELOAD_DELAY = 500;
var gulpENV;

var paths = {
    base : './public/',
    scripts: ['./public/**/*.js', './public/scripts/**/*.js'],
    styles: ['./public/styles/*.css', './public/styles/*.scss'],
    images : './public/images/**/*',
    index: './public/index.html',
    partials: ['public/**/*.html', 'public/scripts/directives/*.html', '!public/index.html'],
    distDev: './dist.dev',
    distProd: './dist.prod',
    distScriptsProd: './dist.prod/scripts',
    distStylesProd: './dist.prod/styles',
    scriptsDevServer: 'server/**/*.js',
    baseView : './render-views/baseView.jade',
    renderViews: './render-views/'
};

var baseFiles = [
    '.htaccess',
    '404.html',
    'crossdomain.xml',
    'humans.txt',
    'robots.txt',
    'sitemap.xml'
]

var pipes = {};

pipes.browserSync = function(cb) {
    browserSync({
        port : 1337,
        proxy : {
            target : 'localhost:3000'
        },
        browser: "google chrome"
    });
    cb();
};

pipes.copyFiles = function() {
    var allBaseFiles = baseFiles.map(function(file) {
        return file = paths.base + file;
    })
    var destPath;
    if(gulpENV == 'production') destPath = paths.distProd;
    else destPath = paths.distDev;
    return gulp.src(allBaseFiles,{base : paths.base})
        .pipe(gulp.dest(destPath))
}

pipes.orderedVendorScripts = function() {
    return plugins.order(['jquery.js', 'angular.js']);
};

pipes.orderedAppScripts = function() {
    return plugins.angularFilesort();
}

pipes.minifiedFileName = function() {
    return plugins.rename(function(path) {
        path.extname = '.min' + path.extname;
    })
};

pipes.validatedAppScripts = function() {
    return gulp.src(paths.scripts)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.builtAppScriptsDev = function() {
    return pipes.validatedAppScripts()
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtAppScriptsProd = function() {
    var scriptedPartials = pipes.scriptedPartials();
    var validatedAppScripts = pipes.validatedAppScripts();

    return es.merge(scriptedPartials, validatedAppScripts)
        .pipe(pipes.orderedAppScripts())
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.concat('app.min.js'))
        //.pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(paths.distScriptsProd));
};

pipes.builtVendorScriptsDev = function() {
    return gulp.src(bowerFiles())
        .pipe(gulp.dest('dist.dev/bower_components'));
};

pipes.builtVendorScriptsProd = function() {
    return gulp.src(bowerFiles('**/*.js'))
        .pipe(pipes.orderedVendorScripts())
        .pipe(plugins.concat('vendor.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(paths.distScriptsProd));
};

pipes.validatedDevServerScripts = function() {
    return gulp.src(paths.scriptsDevServer)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.validatedPartials = function() {
    return gulp.src(paths.partials)
        .pipe(plugins.htmlhint({'doctype-first' : false}))
        .pipe(plugins.htmlhint.reporter());
};

pipes.builtPartialsDev = function() {
    return pipes.validatedPartials()
        .pipe(gulp.dest(paths.distDev));
};

pipes.scriptedPartials = function() {
    return pipes.validatedPartials()
        .pipe(plugins.htmlhint.failReporter())
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(plugins.ngHtml2js({
            moduleName : 'freqCultureApp',
            declareModule: false,
        }));
};

pipes.builtStylesDev = function() {
    return gulp.src(paths.styles)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass())
        .pipe(plugins.autoprefixer({
            browsers: autoPrefixBrowserList,
            cascade:  true
        }))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(paths.distDev));

};

pipes.builtStylesProd = function() {
    return gulp.src(paths.styles)
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass())
            .pipe(plugins.minifyCss())
        .pipe(plugins.sourcemaps.write())
        .pipe(pipes.minifiedFileName())
        .pipe(gulp.dest(paths.distStylesProd));
};

pipes.builtVendorStylesProd = function() {
    return gulp.src(bowerFiles('**/*.css'))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('vendor.css'))
        .pipe(plugins.minifyCss())
        .pipe(pipes.minifiedFileName())
        .pipe(gulp.dest(paths.distStylesProd))
};

pipes.processedImagesDev = function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest(paths.distDev + '/images/'));
};

pipes.processedImagesProd = function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest(paths.distProd + '/images/'));
};

pipes.iconsDev = function() {
    return gulp.src('bower_components/components-font-awesome/fonts/**.*')
        .pipe(gulp.dest(paths.distDev + '/fonts'));
};

pipes.iconsProd = function() {
    return gulp.src('bower_components/components-font-awesome/fonts/**.*')
        .pipe(gulp.dest(paths.distProd + '/fonts'));
};

pipes.validatedIndex = function() {
    return gulp.src(paths.index)
        .pipe(plugins.htmlhint())
        .pipe(plugins.htmlhint.reporter());
};

pipes.builtBaseViewDev = function() {
    var orderedVendorScripts = pipes.builtVendorScriptsDev()
        .pipe(pipes.orderedVendorScripts());

    var orderedAppScripts = pipes.builtAppScriptsDev()
        .pipe(pipes.orderedAppScripts());

    var appStyles = pipes.builtStylesDev();

    pipes.iconsDev();

    return gulp.src(paths.baseView)
        .pipe(gulp.dest(paths.renderViews))
        .pipe(plugins.inject(orderedVendorScripts, {ignorePath : '/dist.dev', name : 'bower'}))
        .pipe(plugins.inject(orderedAppScripts, {ignorePath : '/dist.dev'}))
        .pipe(plugins.inject(appStyles, {ignorePath : '/dist.dev'}))
        .pipe(gulp.dest(paths.renderViews))
}

pipes.builtBaseViewProd = function() {
    var vendorScripts = pipes.builtVendorScriptsProd();
    var vendorStyles = pipes.builtVendorStylesProd();
    var appScripts = pipes.builtAppScriptsProd();
    var appStyles = pipes.builtStylesProd();
    pipes.iconsProd();

    return gulp.src(paths.baseView)
        .pipe(gulp.dest(paths.renderViews))
        .pipe(plugins.inject(appStyles, {ignorePath : '/dist.prod'}))
        .pipe(plugins.inject(vendorStyles, {ignorePath : '/dist.prod', name : 'bower', base: 'styles/'}))
        .pipe(plugins.inject(vendorScripts, {ignorePath : '/dist.prod', name : 'bower'}))
        .pipe(plugins.inject(appScripts, {ignorePath : '/dist.prod'}))
        .pipe(gulp.dest(paths.renderViews))
};


pipes.builtIndexDev = function() {
    var orderedVendorScripts = pipes.builtVendorScriptsDev()
        .pipe(pipes.orderedVendorScripts());

    var orderedAppScripts = pipes.builtAppScriptsDev()
        .pipe(pipes.orderedAppScripts());

    var appStyles = pipes.builtStylesDev();

    pipes.iconsDev();

    return pipes.validatedIndex()
        .pipe(gulp.dest(paths.distDev))
        .pipe(plugins.inject(orderedVendorScripts, {relative : true, name : 'bower'}))
        .pipe(plugins.inject(orderedAppScripts, {relative : true}))
        .pipe(plugins.inject(appStyles, {relative : true}))
        .pipe(gulp.dest(paths.distDev))
};


pipes.builtIndexProd = function() {
    var vendorScripts = pipes.builtVendorScriptsProd();
    var appScripts = pipes.builtAppScriptsProd();
    var appStyles = pipes.builtStylesProd();
    pipes.iconsProd();


    return pipes.validatedIndex()
        .pipe(gulp.dest(paths.distProd))
        .pipe(plugins.inject(vendorScripts, {relative : true, name : 'bower'}))
        .pipe(plugins.inject(appScripts, {relative : true}))
        .pipe(plugins.inject(appStyles, {relative : true}))
        .pipe(plugins.htmlmin({collapseWhitespace : true, removeComments : true}))
        .pipe(gulp.dest(paths.distProd));
};

pipes.builtAppDev = function() {
    pipes.copyFiles();
    return es.merge(pipes.builtBaseViewDev(), pipes.builtPartialsDev(), pipes.processedImagesDev());
};

pipes.builtAppProd = function() {
    pipes.copyFiles();
    return es.merge(pipes.builtBaseViewProd(), pipes.processedImagesProd());
};


/**
 * Gulp Tasks
  */


//compressing images & handle SVG files
gulp.task('images', function(tmp) {
    gulp.src([base+'images/*.jpg', base+'images/*.png'])
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
        .pipe(gulp.dest('app/images'));
});

//compressing images & handle SVG files
gulp.task('images-deploy', function() {
    gulp.src(['app/images/**/*', '!app/images/README'])
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest('dist/images'));
});

gulp.task('nodemon', function(cb) {
    var called = false;

    return plugins.nodemon({
        script : './server/www',
        ext : 'js',
        watch : ['server/', 'app.js'],
        env : {NODE_ENV : gulpENV}
    })
        .on('start', function onStart() {
            if(!called){cb();}
            called = true;
        })
        .on('restart', function onRestart() {
            setTimeout(function reload() {
                browserSync.reload({
                    stream : false
                });
            }, BROWSER_SYNC_RELOAD_DELAY);
        })
});

gulp.task('browser-sync', ['nodemon'], function() {
    browserSync({
        port : 1337,
        proxy : {
            target : 'localhost:3000'
        },
        browser: "google chrome"
    });
});

gulp.task('clean-dev', function() {
    var deferred = Q.defer();
    gulpENV = 'development';
    del(paths.distDev, function() {
        deferred.resolve();
    });
    return deferred.promise;
});

gulp.task('clean-prod', function() {
    var deferred = Q.defer();
    gulpENV = 'production';

    del(paths.distProd, function() {
        deferred.resolve();
    })
    return deferred.promise;
});

gulp.task('iconsDev', function() {
    return gulp.src('bower_components/components-font-awesome/fonts/**.*')
        .pipe(gulp.dest(paths.distDev + '/fonts'));
});


gulp.task('validate-partials', pipes.validatedPartials);

gulp.task('validate-index', pipes.validatedIndex);

gulp.task('build-partials-dev', pipes.builtPartialsDev);

gulp.task('convert-partials-to-js', pipes.scriptedPartials);

gulp.task('validate-devserver-scripts', pipes.validatedDevServerScripts);

gulp.task('validate-app-scripts', pipes.validatedAppScripts);

gulp.task('build-app-scripts-dev', pipes.builtAppScriptsDev);

gulp.task('build-app-scripts-prod', pipes.builtAppScriptsProd);

gulp.task('build-styles-dev', pipes.builtStylesDev);

gulp.task('build-styles-prod', pipes.builtStylesProd);

gulp.task('build-vendor-scripts-dev', pipes.builtVendorScriptsDev);

gulp.task('build-vendor-scripts-prod', pipes.builtVendorScriptsProd);

gulp.task('build-index-dev', pipes.builtBaseViewDev);

gulp.task('build-index-prod', pipes.builtIndexProd);

gulp.task('build-app-dev', pipes.builtAppDev);

gulp.task('build-app-prod', pipes.builtAppProd);

gulp.task('clean-build-app-dev', ['clean-dev'], pipes.builtAppDev);

gulp.task('clean-build-app-prod', ['clean-prod'], pipes.builtAppProd);

gulp.task('watch-dev', ['clean-build-app-dev', 'browser-sync'], function() {


    gulp.watch(paths.index, function() {
        return pipes.builtBaseViewDev()
            .pipe(browserSync.reload({stream: true}));
    });

    gulp.watch(paths.scripts, function() {
        return pipes.builtAppScriptsDev()
            .pipe(browserSync.reload({stream: true}));
    });

    gulp.watch(paths.partials, function() {
        return pipes.builtPartialsDev()
            .pipe(browserSync.reload({stream: true}));
    });

    gulp.watch(paths.styles, function() {
        return pipes.builtStylesDev()
            .pipe(browserSync.reload({stream: true}));
    });

});

gulp.task('watch-prod', ['clean-build-app-prod', 'browser-sync'], function() {

    gulp.watch(paths.index, function() {
        return pipes.builtBaseViewProd()
            .pipe(browserSync.reload({stream: true}));
    });

    gulp.watch(paths.scripts, function() {
        return pipes.builtAppScriptsProd()
            .pipe(browserSync.reload({stream: true}));
    });

    gulp.watch(paths.partials, function() {
        return pipes.builtAppScriptsProd()
            .pipe(browserSync.reload({stream: true}));
    });

    gulp.watch(paths.styles, function() {
        return pipes.builtStylesProd()
            .pipe(browserSync.reload({stream: true}));
    });
});

gulp.task('default', ['clean-build-app-prod']);
//gulp.task('browserSync',['nodemon'], function() {
//    browserSync({
//        server: {
//            baseDir: "app/"
//        },
//        options: {
//            reloadDelay: 250
//        },
//        port : 3001,
//        notify: false
//    });
//});
//gulp.task('browserSync', ['nodemon'], function() {
//    browserSync.init({
//        port : 1337,
//        proxy : {
//            target : 'localhost:3000'
//        }
//    })
//    //browserSync.init(null, {
//    //    proxy: "http://localhost:3000",
//    //    files: ["public/**/*.*"],
//    //    browser: "google chrome",
//    //    port: 7000,
//    //});
//});
