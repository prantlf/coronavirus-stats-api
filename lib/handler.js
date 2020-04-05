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
const { updateAll } = require('./updater')
const { getNow } = require('./date')

function handleWorld (request) {
  const { latest, all } = request.query
  const { from, to, hour } = checkRange(request.query)
  return checkFlag('latest', latest)
    ? getLatestWorldData()
    : checkFlag('all', all)
      ? getAllWorldData()
      : from
        ? getRangedWorldData(from, to, hour)
        : getLatestWorldData(6 * 24)
}

function handleCountries (request) {
  const { country, latest, all } = request.query
  const allFlag = checkFlag('all', all)
  if (country !== undefined || !allFlag) {
    checkCountry(country)
  }
  const { from, to, hour } = checkRange(request.query)
  return checkFlag('latest', latest)
    ? getLatestCountryData(country)
    : allFlag
      ? country
        ? getAllCountryData(country)
        : getAllCountriesData()
      : from
        ? getRangedCountryData(country, from, to, hour)
        : getLatestCountryData(country, 6 * 24)
}

function handleUpdate () {
  return updateAll()
}

function handleNow () {
  return getNow()
}

async function handleRequest (request) {
  const path = request.path
  let status
  let result
  try {
    if (path === '/api/world') {
      result = await handleWorld(request)
    } else if (path === '/api/countries') {
      result = await handleCountries(request)
    } else if (path === '/api/update') {
      result = await handleUpdate()
    } else if (path === '/api/now') {
      result = await handleNow()
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
