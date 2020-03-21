const { join } = require('path')
const { promisify } = require('util')
const { readFile: readFileOld } = require('fs')
const readFile = promisify(readFileOld)

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

async function readJSONFile (path) {
  const content = await readFile(join(__dirname, path), 'utf-8')
  return JSON.parse(content)
}

async function refreshCountries () {
  ([excludedCountries, countries] = await Promise.all([
    readJSONFile('../data/excluded-countries.json'),
    readJSONFile('../data/countries.json')
  ]))
}

refreshCountries()

module.exports = {
  isExcludedCountry, getCountryCode, getCountryCount, getCountries, refreshCountries
}
