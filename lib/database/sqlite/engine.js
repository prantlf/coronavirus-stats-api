const { join } = require('path')
const Database = require('better-sqlite3')

let lastStatement
const file = join(__dirname, '../../../data/data.db')
let database = new Database(file, {
  verbose: text => {
    if (text !== 'ROLLBACK') {
      lastStatement = text
    }
  }
})

async function disconnectDatabase () {
  if (database) {
    database.close()
    database = null
  }
}

function getLastStatement () {
  return lastStatement
}

function prepareTransaction (callback) {
  return database.transaction(callback)
}

function prepareStatement (statement) {
  return database.prepare(statement)
}

function executeStatement (statement) {
  prepareStatement(statement)
    .run()
}

async function hasTable (table) {
  const getTable = prepareStatement(
    'SELECT name FROM sqlite_master WHERE type=? AND name=?')
  const data = getTable
    .raw()
    .all('table', table)
  return data.length > 0
}

async function dropTable (table) {
  executeStatement(`DROP TABLE IF EXISTS ${table}`)
}

async function getAllData (table, where, parameters) {
  const selectAll = prepareStatement(`SELECT * FROM ${table}${where}`)
  const columns = selectAll
    .columns()
    .map(({ name }) => name)
  const data = selectAll
    .raw()
    .all(parameters)
  return { columns, data }
}

async function getLatestData (table, where, parameters, limit) {
  const selectLatest = prepareStatement(`SELECT * FROM ${table}${where}
    ORDER BY date DESC, hour DESC LIMIT ${limit}`)
  const columns = selectLatest
    .columns()
    .map(({ name }) => name)
  const data = selectLatest
    .raw()
    .all(parameters)
  return { columns, data }
}

async function getRangedData (table, where, parameters, from, to, hour) {
  const hourCondition = hour !== undefined ? ' AND hour = ?' : ''
  const startWhere = where ? `${where} AND` : ' WHERE'
  const selectRanged = prepareStatement(`SELECT * FROM ${table}
    ${startWhere} date >= ? AND date <= ?${hourCondition}
    ORDER BY date ASC, hour ASC`)
  let fullParameters = hour !== undefined ? [from, to, hour] : [from, to]
  fullParameters = parameters.concat(fullParameters)
  const columns = selectRanged
    .columns()
    .map(({ name }) => name)
  const data = selectRanged
    .raw()
    .all(fullParameters)
  return { columns, data }
}

module.exports = {
  prepareTransaction,
  prepareStatement,
  executeStatement,
  hasTable,
  dropTable,
  getAllData,
  getLatestData,
  getRangedData,
  getLastStatement,
  disconnectDatabase
}
