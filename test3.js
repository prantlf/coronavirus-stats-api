require('dotenv').config()
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
  queueLimit: 0,
  connectTimeout: 60000,
  dateStrings: true
}).promise()

async function executeQuery (sql, values) {
  const [data, fields] = await database.execute({
    sql, values, rowsAsArray: true
  })
  const columns = fields.map(({ name }) => name)
  return { columns, data }
}

async function main () {
  return executeQuery(`WITH day as (SELECT date, max(hour) as hour from world GROUP BY date)
    SELECT * FROM world, day
    WHERE world.date = day.date AND world.hour = day.hour AND world.date >= '2020-03-15' AND world.date <= '2020-03-20'
    ORDER BY world.date ASC`, [])
}

main()
  .then(result => console.info(result))
  .catch(error => console.error(error))
  .finally(() => database.end())
