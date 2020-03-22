const {
  ensureWorldTable, dropWorldTable
} = require('./database/world')
const {
  ensureCountriesTable, dropCountriesTable
} = require('./database/countries')
const { disconnectDatabase } = require('./database/engine')

async function ensureDatabase () {
  await Promise.all([ensureWorldTable(), ensureCountriesTable()])
}

async function clearDatabase () {
  await Promise.all([dropWorldTable(), dropCountriesTable()])
}

module.exports = { ensureDatabase, clearDatabase, disconnectDatabase }
