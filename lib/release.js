/**
 * modified from https://github.com/vuejs/vue-next/blob/master/scripts/release.js
 */
// import colors from 'picocolors'
// import * as execa from 'execa'
// import { readFileSync, writeFileSync } from 'fs'
// import path from 'path'
// import prompts from 'prompts'
// import semver from 'semver'

// import { fileURLToPath } from 'url'
// import { dirname } from 'path'
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// require 不能被esmodule识别，只能自主创建
// import { createRequire } from "module";
// const myRequire = createRequire(import.meta.url);
const path = require('path')
const { readFileSync, writeFileSync } = require('fs')
const colors = require('picocolors')
const execa = require('execa')
const semver = require('semver')
const prompts = require('prompts')

const args = require('minimist')(process.argv.slice(2))
const pkgDir = process.cwd()
const pkgPath = path.resolve(pkgDir, './package.json')
const pkg = require(pkgPath)
const pkgName = pkg.name
const currentVersion = pkg.version
const isDryRun = args.dry
const skipBuild = args.skipBuild
console.log(colors.blue(`pkg Info: ${pkgName} @${currentVersion} >>${pkgPath}`))

const versionIncrements = [
  'patch',
  'minor',
  'major',
  'prepatch',
  'preminor',
  'premajor',
  'prerelease'
]

const inc = (i) => semver.inc(currentVersion, i, 'beta')

// type RunFn = (
//   bin: string,
//   args: string[],
//   opts?: ExecaOptions<string>
// ) => ExecaChildProcess<string>

const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts })

const dryRun = (bin, args, opts) =>
  console.log(colors.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts)

const runIfNotDry = isDryRun ? dryRun : run

const step = (msg) => console.log(colors.cyan(msg))

async function main() {
  let targetVersion = args._[0]

  if (!targetVersion) {
    // no explicit version, offer suggestions
    const { release } = await prompts({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements
        .map((i) => `${i} (${inc(i)})`)
        .concat(['custom'])
        .map((i) => ({ value: i, title: i }))
    })

    if (release === 'custom') {
      const res = await prompts({
        type: 'text',
        name: 'version',
        message: 'Input custom version',
        initial: currentVersion
      })
      targetVersion = res.version
    } else {
      targetVersion = release.match(/\((.*)\)/)[1]
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`)
  }

  const tag = `v${targetVersion}`

  if (targetVersion.includes('beta') && !args.tag) {
    const { tagBeta } = await prompts({
      type: 'confirm',
      name: 'tagBeta',
      message: `Publish under dist-tag "beta"?`
    })

    if (tagBeta) args.tag = 'beta'
  }

  const { yes } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: `Releasing ${tag}. Confirm?`
  })

  if (!yes) {
    return
  }

  step('\nUpdating package version...')
  updateVersion(targetVersion)

  step('\nBuilding package...')
  if (!skipBuild && !isDryRun) {
    await run('npm', ['run', 'build'])
  } else {
    console.log(`(skipped)`)
  }

  step('\nGenerating changelog...')
  // await run('npm', ['run', 'changelog'])

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {
    step('\nCommitting changes...')
    await runIfNotDry('git', ['add', '-A'])
    await runIfNotDry('git', ['commit', '-m', `release: ${tag}`])
    await runIfNotDry('git', ['tag', tag])
  } else {
    console.log('No changes to commit.')
  }

  step('\nPublishing package...')
  await publishPackage(targetVersion, runIfNotDry)

  step('\nPushing to GitLab...')
  await runIfNotDry('git', ['push', 'origin', `refs/tags/${tag}`])
  await runIfNotDry('git', ['push'])

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`)
  }

  console.log()
}

function updateVersion(version) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  pkg.version = version
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

async function publishPackage(version, runIfNotDry) {
  const publishArgs = ['publish']
  if (args.tag) {
    publishArgs.push(`--tag`, args.tag)
  }
  try {
    await runIfNotDry('npm', publishArgs, {
      stdio: 'pipe'
    })
    console.log(colors.green(`Successfully published ${pkgName}@${version}`))
  } catch (e) {
    if (e.stderr.match(/previously published/)) {
      console.log(colors.red(`Skipping already published: ${pkgName}`))
    } else {
      throw e
    }
  }
}

main().catch((err) => {
  console.error(err)
})