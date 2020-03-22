const { ensureWorldTable } = require('./database/world')
const { ensureCountriesTable } = require('./database/countries')

async function ensureDatabase () {
  await Promise.all([ensureWorldTable(), ensureCountriesTable()])
}

module.exports = { ensureDatabase }
