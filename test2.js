const { join } = require('path')
const Database = require('better-sqlite3')

let lastStatement
const file = join(__dirname, 'data/data.db')
let database = new Database(file, {
  verbose: text => {
    if (text !== 'COMMIT' && text !== 'ROLLBACK') {
      lastStatement = text
    }
  }
})

function executeQuery (query, parameters) {
  const statement = database.prepare(query)
  const columns = statement
    .columns()
    .map(({ name }) => name)
  const data = statement
    .raw()
    .all(parameters)
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
  .finally(() => database.close())
