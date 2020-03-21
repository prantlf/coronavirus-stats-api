const { writeFile } = require('./files')
const { getAllWorldData } = require('../lib/database/world')
const { getAllCountriesData } = require('../lib/database/countries')

function exportAll () {
  const world = getAllWorldData()
  const countries = getAllCountriesData()
  return { world, countries }
}

async function exportAllToFile (file) {
  const data = exportAll()
  await writeFile(file, JSON.stringify(data))
}

module.exports = { exportAll, exportAllToFile }
