const { createPool } = require('mysql2')

const development = process.env.NODE_ENV === 'development'

const databaseName = process.env.DATABASE_NAME
let database = createPool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
  connectTimeout: 60000,
  dateStrings: true
}).promise()

async function disconnectDatabase () {
  if (database) {
    await database.end()
    database = null
  }
}

function getLastStatement () {}

async function beginTransaction () {
  const connection = await database.getConnection()
  try {
    await connection.beginTransaction()
    return {
      connection,
      async commit () {
        try {
          await connection.commit()
        } catch (error) {
          await connection.release()
          throw error
        }
      },
      async rollback () {
        try {
          await connection.rollback()
        } catch (error) {
          await connection.release()
          throw error
        }
      }
    }
  } catch (error) {
    await connection.release()
    throw error
  }
}

function logStatement (connection, sql, values) {
  if (development) {
    if (typeof sql === 'object') {
      ({ sql, values } = sql)
    }
    const text = connection.format(sql, values)
    process.stderr.write(`${text}\n`)
  }
}

function executeStatement (connection, statement, parameters = []) {
  logStatement(connection, statement, parameters)
  return connection.execute(statement, parameters)
}

function executeTransaction ({ connection }, statement, parameters) {
  return executeStatement(connection, statement, parameters)
}

function executeCommand (statement, parameters) {
  return executeStatement(database, statement, parameters)
}

async function hasTable (table) {
  const [results] = await executeCommand(`SELECT *
    FROM information_schema.tables
    WHERE table_schema = ? AND table_name = ?`, [databaseName, table])
  return results.length > 0
}

async function hasIndex (table, index) {
  const [results] = await executeCommand(`SELECT *
    FROM information_schema.statistics
    WHERE table_schema = ? AND table_name = ? AND index_name = ?`,
  [databaseName, table, index])
  return results.length > 0
}

async function dropTable (table) {
  return executeCommand(`DROP TABLE IF EXISTS ${table}`)
}

async function executeQuery (sql, values) {
  const [data, fields] = await executeCommand({
    sql, values, rowsAsArray: true
  })
  const columns = fields.map(({ name }) => name)
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
  beginTransaction,
  executeTransaction,
  executeCommand,
  hasTable,
  hasIndex,
  dropTable,
  getAllData,
  getLatestData,
  getRangedData,
  getLastStatement,
  disconnectDatabase
}
