const { join } = require('path')
const Database = require('better-sqlite3')

const development = process.env.NODE_ENV === 'development'

let lastStatement
const file = join(__dirname, '../../../data/data.db')
let database = new Database(file, {
  verbose: text => {
    if (development) {
      process.stderr.write(`${text}\n`)
    }
    if (text !== 'COMMIT' && text !== 'ROLLBACK') {
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

function executeCommand (statement) {
  return prepareStatement(statement).run()
}

async function hasTable (table) {
  const results = executeQuery(`SELECT name FROM sqlite_master
    WHERE type=? AND name=?`, ['table', table])
  return results.length > 0
}

async function dropTable (table) {
  return executeCommand(`DROP TABLE IF EXISTS ${table}`)
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
    ORDER BY date ASC, hour ASC LIMIT ${limit}`, parameters)
}

async function getRangedData (table, where, parameters, from, to, hour) {
  const startWhere = where ? `${where} AND` : ' WHERE'
  const rangeParameters = typeof hour === 'number' ? [from, to, hour] : [from, to]
  let fullParameters = parameters.concat(rangeParameters)
  if (hour === 'any') {
    const grouping = where ? 'country, ' : ''
    const having = where ? 'country = ? AND ' : ''
    const limiting = where ? `${table}.country = ? AND ` : ''
    fullParameters = rangeParameters.concat(fullParameters)
    if (where) {
      fullParameters = parameters.concat(fullParameters)
    }
    return executeQuery(`WITH day as (SELECT ${grouping}date, MAX(hour) as hour
      FROM ${table} GROUP BY ${grouping}date HAVING ${having}date >= ? AND date <= ?)
      SELECT ${table}.* FROM ${table}, day
      WHERE ${limiting}${table}.date = day.date AND ${table}.hour = day.hour
      AND ${table}.date >= ? AND ${table}.date <= ?
      ORDER BY ${table}.date ASC`, fullParameters)
  }
  const hourCondition = typeof hour === 'number' ? ' AND hour = ?' : ''
  return executeQuery(`SELECT * FROM ${table}
    ${startWhere} date >= ? AND date <= ?${hourCondition}
    ORDER BY date ASC, hour ASC`, fullParameters)
}

module.exports = {
  prepareTransaction,
  prepareStatement,
  executeCommand,
  hasTable,
  dropTable,
  getAllData,
  getLatestData,
  getRangedData,
  getLastStatement,
  disconnectDatabase
}
