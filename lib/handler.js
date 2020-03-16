const {
  getAllWorldData, getLatestWorldData, getRangedWorldData
} = require('./database/world')
const {
  getAllCountriesData, getAllCountryData,
  getLatestCountryData, getRangedCountryData
} = require('./database/countries')
const {
  checkCountry, checkRange, checkFlag
} = require('./checks')

function handleWorld (req) {
  const { latest, all } = req.query
  const { from, to, hour } = checkRange(req.query)
  return checkFlag('latest', latest)
    ? getLatestWorldData(1)
    : checkFlag('all', all)
      ? getAllWorldData()
      : from
        ? getRangedWorldData(from, to, hour)
        : getLatestWorldData(7 * 24)
}

function handleCountries (req) {
  const { country, latest, all } = req.query
  const allFlag = checkFlag('all', all)
  if (country !== undefined || !allFlag) {
    checkCountry(country)
  }
  const { from, to, hour } = checkRange(req.query)
  return checkFlag('latest', latest)
    ? getLatestCountryData(country)
    : allFlag
      ? country
        ? getAllCountryData(country)
        : getAllCountriesData()
      : from
        ? getRangedCountryData(country, from, to, hour)
        : getLatestCountryData(country, 7 * 24)
}

function handleRequest (req) {
  const path = req.path
  let status
  let result
  try {
    if (path === '/world') {
      result = handleWorld(req)
    } else if (path === '/countries') {
      result = handleCountries(req)
    } else {
      status = 404
      result = { error: 'Unrecognized resource' }
    }
  } catch (error) {
    status = error instanceof RangeError ? 400 : 500
    result = { error: error.message }
  }
  return { status, result }
}

module.exports = { handleRequest }
