const { getFirstElement, getElements, getText, getNumber } = require('./html')
const { getCountryCode, isExcludedCountry } = require('../countries')

const labels = [
  'Country,Other', 'TotalCases', 'NewCases', 'TotalDeaths', 'NewDeaths',
  'TotalRecovered', 'ActiveCases', 'Serious,Critical'
]

function getCountrySummaries (page) {
  const body = page('body')
  const table = getFirstElement(body, '#main_table_countries_today')
  const header = getElements(table, 'thead tr th')
  const rowSize = header.length
  if (rowSize < labels.length) {
    throw new Error(
      `The table header contained only ${rowSize} cells.`)
  }
  for (let labelIndex = 0, labelCount = labels.length;
       labelIndex < labelCount; ++labelIndex) {
    const text = getText(header[labelIndex])
    if (text != labels[labelIndex]) {
      throw new Error(
        `The table header "${text}" differed from the expected "${labels[labelIndex]}".`)
    }
  }
  const cells = getElements(table, 'tbody tr td')
  const data = []
  for (let cellIndex = 0, cellCount = cells.length - rowSize;
       cellIndex < cellCount; cellIndex += rowSize) {
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
