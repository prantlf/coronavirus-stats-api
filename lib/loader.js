const { join } = require('path')
const { promisify } = require('util')
const { writeFile: writeFileOld } = require('fs')
const writeFile = promisify(writeFileOld)
const cheerio = require('cheerio')
const { get } = require('httpie')

async function loadMainPage () {
  const { data } = await get('https://www.worldometers.info/coronavirus/')
  const file = join(__dirname, '../data/main.html')
  await writeFile(file, data)
  return cheerio.load(data)
}

module.exports = { loadMainPage }
