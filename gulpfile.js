/**
 * @file gulpfile
 * @author yangjun14@baidu.com
 */

/* eslint-disable fecs-no-require */

const gulp = require('gulp')
const path = require('path')
const { amdWrap } = require('gulp-amd-wrap')
const { resolve } = require('path')
const httpPush = require('gulp-deploy-http-push')
  .httpPush
const ts = require('gulp-typescript')
const project = ts.createProject('tsconfig.amd.json', {
  declaration: true
})
const filter = require('gulp-filter')

// TODO
// gulp-typescript 插件无法 emitDeclarationOnly，故用 npm script 实现
// https://github.com/ivogabe/gulp-typescript/issues/607
gulp.task('build', () => {
  const f = filter(['**/*.js'], { restore: true })

  return gulp
    .src(['src/**/*.ts'], { base: path.resolve('src') })
    .pipe(project())
    .pipe(f)
    .pipe(amdWrap({
      baseUrl: path.resolve(__dirname, 'dist'),
      anonymousModule: ['**/*'],
      exlude: ['*.ts']
    }))
    .pipe(f.restore)
    .pipe(gulp.dest('dist'))
})

gulp.task('deploy', () => {
  const HOST = require('./dev.config.js')
    .receiver
  if (HOST) {
    return gulp
      .src(
        ['src/smarty-plugins/*'], { base: resolve(__dirname, 'src/smarty-plugins') }
      )
      .pipe(httpPush([{
        host: HOST,
        match: '/**/*.php',
        to: '/home/work/search/view-ui/php/phplib/ext/smarty/baiduplugins'
      }]))
  }
})

gulp.task('deploy:project', () => {
  const packages = require('./dev.config.js')
    .packages
  if (packages) {
    let out = gulp.src(['dist/**/*'])
    packages.forEach(package => {
      const path = resolve(package, '@baidu/molecule/dist')
      console.log(`=> ${path}`)
      out = out.pipe(gulp.dest(path))
    })
    return out
  }
})

gulp.task('watch', () => {
  gulp.watch('./src/**/*.php', gulp.series('deploy'))

  if (process.env.NODE_ENV) {
    gulp.watch('./src/**/*.ts', gulp.series('build', 'deploy:project'))
  } else {
    gulp.watch('./src/**/*.ts', gulp.series('build'))
  }
})

gulp.task('default', gulp.series('watch'))
