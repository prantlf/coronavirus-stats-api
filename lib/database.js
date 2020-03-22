const { ensureWorldTable } = require('./database/world')
const { ensureCountriesTable } = require('./database/countries')
const { disconnectDatabase } = require('./database/engine')

async function ensureDatabase () {
  await Promise.all([ensureWorldTable(), ensureCountriesTable()])
}

module.exports = { ensureDatabase, disconnectDatabase }
