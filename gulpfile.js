/**
 * @file gulpfile
 * @author yangjun14@baidu.com
 */

/* eslint-disable fecs-no-require */

const gulp = require('gulp');
const path = require('path');
const { amdWrap } = require('gulp-amd-wrap');
const { resolve } = require('path');
const httpPush = require('gulp-deploy-http-push').httpPush;
const ts = require('gulp-typescript');
const project = ts.createProject('./typescript/tsconfig.amd.json', {
    declaration: true
});
const projectEsm = ts.createProject('./typescript/tsconfig.esm5.json', {
    declaration: true
});
const projectCjs = ts.createProject('./typescript/tsconfig.cjs.json', {
    declaration: true
});
const filter = require('gulp-filter');

gulp.task('build-amd', () => {
    const f = filter(['**/*.js'], { restore: true });

    const stream = gulp
        .src(['src/**/*.ts'], { base: path.resolve('src') })
        .pipe(project())
        .pipe(f)
        .pipe(amdWrap({
            baseUrl: path.resolve(__dirname, 'dist'),
            anonymousModule: ['**/*'],
            exlude: ['*.ts']
        }))
        .pipe(gulp.dest('dist/amd'));

    f.restore.pipe(gulp.dest('dist/types'));

    return stream;
});

gulp.task('build-esm5', () => {
    const f = filter(['**/*.js']);
    const stream = gulp
        .src(['src/**/*.ts'], { base: path.resolve('src') })
        .pipe(projectEsm())
        .pipe(f)
        .pipe(gulp.dest('dist/esm5'));
    return stream;
});

gulp.task('build-cjs', () => {
    const f = filter(['**/*.js']);
    const stream = gulp
        .src(['src/**/*.ts'], { base: path.resolve('src') })
        .pipe(projectCjs())
        .pipe(f)
        .pipe(gulp.dest('dist/cjs'));
    return stream;
});

gulp.task('build-demo', () => {
    const f = filter(['**/*.js'], { restore: true });

    return gulp
        .src(['example/**/*.ts'], { base: path.resolve('example') })
        .pipe(project())
        .pipe(f)
        .pipe(amdWrap({
            baseUrl: path.resolve(__dirname, 'example'),
            anonymousModule: ['**/*'],
            exlude: ['*.ts']
        }))
        .pipe(f.restore)
        .pipe(gulp.dest('example'));
});

gulp.task('build', gulp.series('build-amd', 'build-esm5', 'build-cjs'));

gulp.task('deploy', () => {
    const HOST = require('./dev.config.js').receiver;
    if (HOST) {
        return gulp
            .src(
                ['src/smarty-plugins/*'], { base: resolve(__dirname, 'src/smarty-plugins') }
            )
            .pipe(httpPush([{
                host: HOST,
                match: '/**/*.php',
                to: '/home/work/search/view-ui/php/phplib/ext/smarty/baiduplugins'
            }]));
    }
});

gulp.task('deploy:project', () => {
    const packages = require('./dev.config.js').packages;
    if (packages) {
        let out = gulp.src(['dist/**/*'])
        packages.forEach(package => {
            const path = resolve(package, '@baidu/molecule/dist');
            console.log(`=> ${path}`);
            out = out.pipe(gulp.dest(path));
        });
        return out;
    }
});

gulp.task('watch', () => {
    gulp.watch('./src/**/*.php', gulp.series('deploy'));
    if (process.env.NODE_ENV) {
        gulp.watch('./src/**/*.ts', gulp.series('build-amd', 'deploy:project'));
    } else {
        gulp.watch('./src/**/*.ts', gulp.series('build-amd'));
    }
});

gulp.task('default', gulp.series('watch'));
