const { ensureWorldTable } = require('./database/world')
const { ensureCountriesTable } = require('./database/countries')

function ensureDatabase () {
  ensureWorldTable()
  ensureCountriesTable()
}

module.exports = { ensureDatabase }
