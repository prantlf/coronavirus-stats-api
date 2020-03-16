const { addCountriesData } = require('../database/countries')
const { getCountrySummaries } = require('../source/countries')

async function updateCountries (page, now) {
  const summaries = getCountrySummaries(page)
  const fullSummaries = summaries.map(summary => now.concat(summary))
  addCountriesData(fullSummaries)
}

module.exports = { updateCountries }
