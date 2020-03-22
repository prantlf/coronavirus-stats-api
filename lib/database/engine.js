const { join } = require('path')
const Database = require('better-sqlite3')

let lastLog
const file = join(__dirname, '../../data/data.db')
const database = new Database(file, {
  verbose: text => (lastLog = text)
})

function getLastLog () {
  return lastLog
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

async function getAllData (table) {
  const selectAll = prepareStatement(`SELECT * FROM ${table}`)
  const columns = selectAll
    .columns()
    .map(({ name }) => name)
  const data = selectAll
    .raw()
    .all()
  return { columns, data }
}

async function getLatestData (table, limit) {
  const selectLatest = prepareStatement(
    `SELECT * FROM ${table} ORDER BY date DESC, hour DESC LIMIT ${limit}`)
  const columns = selectLatest
    .columns()
    .map(({ name }) => name)
  const data = selectLatest
    .raw()
    .all()
  return { columns, data }
}

async function getRangedData (table, from, to, hour) {
  const hourCondition = hour !== undefined ? ' AND hour = ?' : ''
  const selectLatest = prepareStatement(
    `SELECT * FROM ${table} WHERE date >= ? AND date <= ?${hourCondition}
    ORDER BY date ASC, hour ASC`)
  const parameters = hour !== undefined ? [from, to, hour] : [from, to]
  const columns = selectLatest
    .columns()
    .map(({ name }) => name)
  const data = selectLatest
    .raw()
    .all(parameters)
  return { columns, data }
}

module.exports = {
  prepareTransaction,
  prepareStatement,
  executeStatement,
  getAllData,
  getLatestData,
  getRangedData,
  getLastLog
}
