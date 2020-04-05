const { promisify } = require('util')
const {
  readFile: readFileOld, writeFile: writeFileOld, access: accessOld
} = require('fs')
const makeDir = require('make-dir')
const { join } = require('path')

const readFile = promisify(readFileOld)
const writeFile = promisify(writeFileOld)
const access = promisify(accessOld)

const directories = new Map()

async function ensureDirectory (directory) {
  let promise = directories.get(directory)
  if (!promise) {
    promise = makeDir(directory)
    directories.set(directory, promise)
    await promise
  }
  return promise
}

async function ensurePath (root, ...directories) {
  let path = root
  await ensureDirectory(path)
  for (const directory of directories) {
    path = join(path, directory)
    await ensureDirectory(path)
  }
}

async function checkFile (path) {
  try {
    await access(path)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

module.exports = { readFile, writeFile, ensurePath, checkFile }
