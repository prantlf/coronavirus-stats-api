const {
  getAllWorldData, getLatestWorldData, getRangedWorldData
} = require('./database/world')
const {
  getAllCountriesData, getAllCountryData,
  getLatestCountryData, getRangedCountryData
} = require('./database/countries')
const { checkCountry, checkRange, checkFlag, createRange } = require('./checks')

module.exports = {
  checkCountry,
  checkRange,
  checkFlag,
  createRange,
  getAllWorldData,
  getLatestWorldData,
  getRangedWorldData,
  getAllCountriesData,
  getAllCountryData,
  getLatestCountryData,
  getRangedCountryData
}
