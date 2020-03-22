const {
  prepareTransaction, prepareStatement, executeStatement,
  dropTable, getAllData, getLatestData, getRangedData
} = require('./engine')
const { getCountryCount } = require('../../countries')

async function ensureCountriesTable () {
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

async function dropCountriesTable () {
  return dropTable('countries')
}

async function addCountriesData (rows) {
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

async function getAllCountriesData () {
  return getAllData('countries', '', [])
}

async function getAllCountryData (country) {
  return getAllData('countries', ' WHERE country = ?', [country])
}

async function getLatestCountriesData (limit) {
  return getLatestData('countries', '', [],
    (limit || 1) * getCountryCount())
}

async function getLatestCountryData (country, limit) {
  return getLatestData('countries', ' WHERE country = ?', [country],
    (limit || 1) * getCountryCount())
}

async function getRangedCountryData (country, from, to, hour) {
  return getRangedData('countries', ' WHERE country = ?', [country],
    from, to, hour)
}

module.exports = {
  ensureCountriesTable,
  dropCountriesTable,
  addCountriesData,
  getAllCountriesData,
  getAllCountryData,
  getLatestCountriesData,
  getLatestCountryData,
  getRangedCountryData
}
