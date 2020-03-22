const { safeLoad: parseYAML } = require('js-yaml')
const { readFile } = require('./files')
const { join } = require('path')

let excludedCountries
let countries

function isExcludedCountry (countryName) {
  return excludedCountries.includes(countryName)
}

function getCountryCode (countryName) {
  for (const country of countries) {
    if (country[0] === countryName) {
      return country[1]
    }
  }
  process.stderr.write(`Country "${countryName}" not recognized.\n`)
}

function getCountryCount (countryName) {
  return countries.length
}

function getCountries () {
  return countries
}

async function loadDataFile (name) {
  const path = join(__dirname, '../data', name)
  const content = await readFile(`${path}.yml`, 'utf-8')
  return parseYAML(content)
}

async function refreshCountries () {
  ([excludedCountries, countries] = await Promise.all([
    loadDataFile('excluded-countries'),
    loadDataFile('countries')
  ]))
}

const promise = refreshCountries()

function ensureCountries () {
  return promise
}

module.exports = {
  isExcludedCountry,
  getCountryCode,
  getCountryCount,
  getCountries,
  ensureCountries,
  refreshCountries
}
