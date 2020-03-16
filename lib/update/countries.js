const { addCountriesData } = require('../database/countries')
const { getCountrySummaries } = require('../source/countries')
const { getNow } = require('./date')

async function updateCountries (page) {
  const summaries = getCountrySummaries(page)
  const now = getNow()
  const fullSummaries = summaries.map(summary => now.concat(summary))
  addCountriesData(fullSummaries)
}

module.exports = { updateCountries }
