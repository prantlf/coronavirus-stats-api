const { promisify } = require('util')
const {
  readFile: readFileOld, writeFile: writeFileOld
} = require('fs')

const readFile = promisify(readFileOld)
const writeFile = promisify(writeFileOld)

module.exports = { readFile, writeFile }
