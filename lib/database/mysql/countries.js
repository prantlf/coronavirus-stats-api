const {
  beginTransaction, executeTransaction, executeStatement,
  hasIndex, dropTable, getAllData, getLatestData, getRangedData
} = require('./engine')
const { getCountryCount } = require('../../countries')

async function ensureCountriesTable () {
  executeStatement(`CREATE TABLE IF NOT EXISTS countries (
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
  )`)
  if (!await hasIndex('countries', 'countries_location')) {
    executeStatement(`CREATE UNIQUE INDEX
      countries_location on countries ( date ASC, hour ASC, country ASC )`)
  }
  if (!await hasIndex('countries', 'countries_date')) {
    executeStatement(`CREATE INDEX
      countries_date on countries ( date ASC )`)
  }
  if (!await hasIndex('countries', 'countries_time')) {
    executeStatement(`CREATE INDEX
      countries_time on countries ( date ASC, hour ASC )`)
  }
  if (!await hasIndex('countries', 'countries_country')) {
    executeStatement(`CREATE INDEX
      countries_country on countries ( country ASC )`)
  }
}

async function dropCountriesTable () {
  return dropTable('countries')
}

async function addCountriesData (rows) {
  const transaction = await beginTransaction()
  try {
    await Promise.all(rows.map(row =>
      executeTransaction(transaction, `INSERT INTO countries (
        date, hour, country, total, active, closed,
        mild, serious, recovered, dead
      ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`, row)))
    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
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
