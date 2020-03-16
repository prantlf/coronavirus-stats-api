const {
  prepareTransaction, prepareStatement, executeStatement,
  getAllData, getLatestData
} = require('./engine')
const countryCount = require('../../data/countries.json').length

function ensureCountriesTable () {
  const createTable = `CREATE TABLE IF NOT EXISTS countries (
    date DATE NOT NULL,
    hour TINYINT NOT NULL,
    country VARCHAR(2) NOT NULL,
    total INT NOT NULL,
    active INT NOT NULL,
    closed INT NOT NULL,
    mild INT NOT NULL,
    serious INT NOT NULL,
    recovered INT NOT NULL,
    dead INT NOT NULL,
    PRIMARY KEY ( date, hour, country ),
    UNIQUE ( date, hour, country )
  ) WITHOUT ROWID`
  executeStatement(createTable)
  const createLocationIndex = `CREATE UNIQUE INDEX IF NOT EXISTS
    location on countries ( date ASC, hour ASC, country ASC )`
  executeStatement(createLocationIndex)
  const createDateIndex = `CREATE INDEX IF NOT EXISTS
    date on countries ( date ASC )`
  executeStatement(createDateIndex)
  const createTimeIndex = `CREATE INDEX IF NOT EXISTS
    time on countries ( date ASC, hour ASC )`
  executeStatement(createTimeIndex)
  const createCountryIndex = `CREATE INDEX IF NOT EXISTS
    country on countries ( country ASC )`
  executeStatement(createCountryIndex)
}

function addCountriesData (rows) {
  const addData = `INSERT INTO countries (
    date, hour, country, total, active, closed,
    mild, serious, recovered, dead
  ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`
  const statement = prepareStatement(addData)
  const transaction = prepareTransaction(rows => {
    for (const row of rows) {
      statement.run(row)
    }
  })
  transaction(rows)
}

function getAllCountriesData () {
  return getAllData('countries')
}

function getAllCountryData (country) {
  const selectAll = prepareStatement(
    'SELECT * FROM countries WHERE country = ?')
  const columns = selectAll
    .columns()
    .map(({ name }) => name)
  const data = selectAll
    .raw()
    .all(country)
  return { columns, data }
}

function getLatestCountriesData (limit) {
  return getLatestData('countries', (limit || 1) * countryCount)
}

function getLatestCountryData (country) {
  const selectLatest = prepareStatement(
    `SELECT * FROM countries WHERE country = ?
     ORDER BY date DESC, hour DESC LIMIT ${countryCount}`)
  const columns = selectLatest
    .columns()
    .map(({ name }) => name)
  const data = selectLatest
    .raw()
    .all(country)
  return { columns, data }
}

function getRangedCountryData (country, from, to, hour) {
  const hourCondition = hour !== undefined ? ' AND hour = ?' : ''
  const selectLatest = prepareStatement(
    `SELECT * FROM countries WHERE country = ? AND date >= ? AND date <= ?${hourCondition}
    ORDER BY date ASC, hour ASC`)
  const parameters = hour !== undefined
    ? [country, from, to, hour] : [country, from, to]
  const columns = selectLatest
    .columns()
    .map(({ name }) => name)
  const data = selectLatest
    .raw()
    .all(parameters)
  return { columns, data }
}

module.exports = {
  ensureCountriesTable,
  addCountriesData,
  getAllCountriesData,
  getAllCountryData,
  getLatestCountriesData,
  getLatestCountryData,
  getRangedCountryData
}
