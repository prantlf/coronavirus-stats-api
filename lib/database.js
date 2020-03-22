const {
  ensureWorldTable, dropWorldTable
} = require('./database/world')
const {
  ensureCountriesTable, dropCountriesTable
} = require('./database/countries')
const { disconnectDatabase } = require('./database/engine')

let databaseEnsured

function ensureDatabase () {
  if (!databaseEnsured) {
    databaseEnsured = Promise.all([ensureWorldTable(), ensureCountriesTable()])
  }
  return databaseEnsured
}

async function clearDatabase () {
  await Promise.all([dropWorldTable(), dropCountriesTable()])
}

module.exports = { ensureDatabase, clearDatabase, disconnectDatabase }
