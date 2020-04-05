const {
  prepareTransaction, prepareStatement, executeCommand,
  dropTable, getAllData, getLatestData, getRangedData
} = require('./engine')
const { getCountryCount } = require('../../countries')

async function ensureCountriesTable () {
  executeCommand(`CREATE TABLE IF NOT EXISTS countries (
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
  ) WITHOUT ROWID`)
  executeCommand(`CREATE UNIQUE INDEX IF NOT EXISTS
    countries_location on countries ( date ASC, hour ASC, country ASC )`)
  executeCommand(`CREATE INDEX IF NOT EXISTS
    countries_date on countries ( date ASC )`)
  executeCommand(`CREATE INDEX IF NOT EXISTS
    countries_time on countries ( date ASC, hour ASC )`)
  executeCommand(`CREATE INDEX IF NOT EXISTS
    countries_country on countries ( country ASC )`)
}

async function dropCountriesTable () {
  return dropTable('countries')
}

async function addCountriesData (rows) {
  const statement = prepareStatement(`INSERT INTO countries (
    date, hour, country, total, active, closed,
    mild, serious, recovered, dead
  ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`)
  const transaction = prepareTransaction(rows => {
    for (const row of rows) {
      statement.run(row)
    }
  })
  return transaction(rows)
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
