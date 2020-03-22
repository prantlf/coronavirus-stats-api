const { writeFile } = require('./files')
const { getAllWorldData } = require('../lib/database/world')
const { getAllCountriesData } = require('../lib/database/countries')

async function exportAll () {
  const [world, countries] = await Promise.all([
    getAllWorldData(), getAllCountriesData()
  ])
  return { world, countries }
}

async function exportAllToFile (file) {
  const data = await exportAll()
  await writeFile(file, JSON.stringify(data))
}

module.exports = { exportAll, exportAllToFile }
