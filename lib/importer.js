const { readFile } = require('./files')
const { addWorldData } = require('../lib/database/world')
const { addCountriesData } = require('../lib/database/countries')

function importAll (data) {
  const { world, countries } = data
  world.data.forEach(addWorldData)
  addCountriesData(countries.data)
}

async function importAllFromFile (file) {
  const content = await readFile(file, 'utf-8')
  importAll(JSON.parse(content))
}

module.exports = { importAll, importAllFromFile }
