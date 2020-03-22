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
  return prepareStatement(statement).run()
}

async function hasTable (table) {
  const results = executeQuery(`SELECT name FROM sqlite_master
    WHERE type=? AND name=?`, ['table', table])
  return results.length > 0
}

async function dropTable (table) {
  return executeStatement(`DROP TABLE IF EXISTS ${table}`)
}

function executeQuery (query, parameters) {
  const statement = prepareStatement(query)
  const columns = statement
    .columns()
    .map(({ name }) => name)
  const data = statement
    .raw()
    .all(parameters)
  return { columns, data }
}

async function getAllData (table, where, parameters) {
  return executeQuery(`SELECT * FROM ${table}${where}`, parameters)
}

async function getLatestData (table, where, parameters, limit) {
  return executeQuery(`SELECT * FROM ${table}${where}
    ORDER BY date DESC, hour DESC LIMIT ${limit}`, parameters)
}

async function getRangedData (table, where, parameters, from, to, hour) {
  const hourCondition = hour !== undefined ? ' AND hour = ?' : ''
  const startWhere = where ? `${where} AND` : ' WHERE'
  let fullParameters = hour !== undefined ? [from, to, hour] : [from, to]
  fullParameters = parameters.concat(fullParameters)
  return executeQuery(`SELECT * FROM ${table}
    ${startWhere} date >= ? AND date <= ?${hourCondition}
    ORDER BY date ASC, hour ASC`, fullParameters)
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
