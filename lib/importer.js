const { readFile } = require('./files')
const { addWorldData } = require('../lib/database/world')
const { addCountriesData } = require('../lib/database/countries')

async function importAll (data) {
  const { world, countries } = data
  await Promise.all([
    addWorldData(world.data), addCountriesData(countries.data)
  ])
}

async function importAllFromFile (file) {
  const content = await readFile(file, 'utf-8')
  await importAll(JSON.parse(content))
}

module.exports = { importAll, importAllFromFile }
