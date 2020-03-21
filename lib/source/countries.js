const {
  getFirstElement, getElements, getText, getNumber
} = require('./html')
const { getCountryCode, isExcludedCountry } = require('../countries')

function getCountrySummaries (page) {
  const body = page('body')
  const table = getFirstElement(body, '#main_table_countries_today')
  const rowSize = 9
  getElements(table, 'thead tr th', rowSize)
  const cells = getElements(table, 'tbody tr td')
  const cellCount = cells.length - rowSize
  const data = []
  for (let cellIndex = 0; cellIndex < cellCount; cellIndex += rowSize) {
    const countryName = getText(cells[cellIndex])
    if (isExcludedCountry(countryName)) {
      continue
    }
    const country = getCountryCode(countryName)
    if (!country) {
      continue
    }
    const total = getNumber(cells[cellIndex + 1])
    const dead = getNumber(cells[cellIndex + 3])
    const recovered = getNumber(cells[cellIndex + 5])
    const active = getNumber(cells[cellIndex + 6])
    const closed = total - active
    const serious = getNumber(cells[cellIndex + 7])
    const mild = active - serious
    data.push([
      country, total, active, closed, mild, serious, recovered, dead
    ])
  }
  return data
}

module.exports = { getCountrySummaries }
