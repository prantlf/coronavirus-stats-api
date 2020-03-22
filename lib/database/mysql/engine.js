const { getDateString } = require('../../date')
const { createPool } = require('mysql2')

const databaseName = process.env.DATABASE_NAME
let database = createPool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0
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

function executeTransaction ({ connection }, statement, parameters) {
  return connection.execute(statement, parameters || [])
}

function executeStatement (statement, parameters) {
  return database.execute(statement, parameters || [])
}

async function hasTable (table) {
  const [results] = await executeStatement(`SELECT *
    FROM information_schema.tables
    WHERE table_schema = ? AND table_name = ?`, [databaseName, table])
  return results.length > 0
}

async function hasIndex (table, index) {
  const [results] = await executeStatement(`SELECT *
    FROM information_schema.statistics
    WHERE table_schema = ? AND table_name = ? AND index_name = ?`,
  [databaseName, table, index])
  return results.length > 0
}

async function dropTable (table) {
  return executeStatement(`DROP TABLE IF EXISTS ${table}`)
}

async function executeQuery (sql, values) {
  const [data, fields] = await executeStatement({
    sql, values, rowsAsArray: true
  })
  const columns = fields.map(({ name }) => name)
  data.forEach(data => {
    data[0] = getDateString(data[0])
  })
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
  beginTransaction,
  executeTransaction,
  executeStatement,
  hasTable,
  hasIndex,
  dropTable,
  getAllData,
  getLatestData,
  getRangedData,
  getLastStatement,
  disconnectDatabase
}
