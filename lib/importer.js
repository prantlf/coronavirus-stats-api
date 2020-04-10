const { readFile } = require('./files')
const { addWorldData } = require('./database/world')
const { addCountriesData } = require('./database/countries')
const { ensureDatabase } = require('./database')
const { ensureCountries } = require('./countries')

async function importAll (data) {
  const { world, countries } = data
  await Promise.all([ensureDatabase(), ensureCountries()])
  // await addWorldData(world.data)
  // await addCountriesData(countries.data)
  await Promise.all([
    addWorldData(world.data), addCountriesData(countries.data)
  ])
}

async function importAllFromFile (file) {
  const content = await readFile(file, 'utf-8')
  await importAll(JSON.parse(content))
}

module.exports = { importAll, importAllFromFile }
