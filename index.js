import cac from 'cac' // 监听shell 命令
import chalk from 'chalk'
import esbuild from 'esbuild'
import { dtsPlugin } from 'esbuild-plugin-d.ts'
import fs from 'fs-extra'
import glob from 'glob' // 获取当前项目的指定文件
import ora from 'ora'
import path from 'path'
import { version } from './package.json'

const distPath = path.join(process.cwd(), 'dist')
fs.existsSync(distPath) && fs.emptyDirSync(distPath)

const cli = cac()

const globFils = async () => {
  return await new Promise((resolve) => {
    glob('src/**/*.ts', { root: process.cwd() }, function (err, files) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      if (files.length === 0) console.error('请检查文件是否在src目标下')
      resolve(files)
    })
  })
}

const buildServe = async (isPro) => {
  const spinner = ora(chalk.blue('Prepare to compile')).start()
  return await esbuild
    .build({
      entryPoints: await globFils(),
      bundle: false,
      splitting: false,
      outdir: path.join(process.cwd(), 'dist'),
      format: 'esm',
      target: 'node14',
      platform: 'node',
      watch: !isPro && {
        onRebuild(err, result) {
          if (err) {
            spinner.fail(err.toString())
          } else {
            spinner.color = 'green'
            spinner.succeed(chalk.green('Compile complete'))
          }
        },
      },
      minify: false,
      sourcemap: false,
      color: true,
      loader: {
        // 默认使用 js loader ,手动改为 jsx-loader
        '.ts': 'tsx',
        '.tsx': 'tsx',
      },
      plugins: [dtsPlugin()],
    })
    .then((res) => {
      spinner.succeed(chalk.green('Compile complete'))
    })
    .catch((err) => {
      console.error(JSON.stringify(err), '\r\n可能当前没有tsconfig.json配置')
    })
}

/** dev start */
cli.command('dev').action(async (argv) => {
  buildServe(false)
})

/** build */
cli.command('build').action(async (argv) => {
  buildServe(true)
})

/** help */
cli.command('').action(async (argv) => {
  cli.outputHelp()
})

/** -h --help */
cli.help()
/** -v --version */
cli.version(version)
/** 解析生效 类似开始监听*/
cli.parse()
