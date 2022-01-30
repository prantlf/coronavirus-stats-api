const data = require('./data/data.json')

require('dotenv').config()

const type = process.env.DATABASE_TYPE
const databases = {
  mysql2: {
    connection: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME
    },
    pool: { min: 1, max: 3 }
  },
  sqlite3: {
    connection: { filename: 'data/data2.db' },
    pool: { min: 1, max: 1 }
  }
}
const database = databases[type]

let knex = require('knex')({
  client: type,
  connection: database.connection,
  pool: database.pool,
  useNullAsDefault: true,
  asyncStackTraces: true,
  debug: true,
  log: {
    warn(message) {
      console.warn(message)
    },
    error(message) {
      console.error(message)
    },
    deprecate(message) {
      console.info(message)
    },
    debug(message) {
      console.log(message)
    }
  }
})

function hasWorldTable () {
  return knex.schema.hasTable('world')
}

function createWorldTable () {
  return knex.schema.createTable('world', table => {
    table.date('date').notNullable().index('world_date')
    table.integer('hour').notNullable().index('world_hour')
    table.integer('total').notNullable()
    table.integer('active').notNullable()
    table.integer('closed').notNullable()
    table.integer('mild').notNullable()
    table.integer('serious').notNullable()
    table.integer('recovered').notNullable()
    table.integer('dead').notNullable()
    table.primary(['date', 'hour'], 'world_key')
    table.unique(['date', 'hour'], 'world_time')
  })
}

async function ensureWorldTable () {
  if (!await hasWorldTable()) {
    await createWorldTable()
  }
}

async function dropWorldTable () {
  if (await hasWorldTable()) {
    return knex.schema.dropTable('world')
  }
}

async function getAllWorld () {
  // const result = await knex
  //   .select()
  //   .from('world')
  //   .first()
  const result = await knex
    .raw('SELECT * FROM world LIMIT 1')
    .options({ rowMode: 'array', rowsAsArray: true })
  if (result) {
    console.log('***', result)
    const {
      date, hour, total, active, closed,
      mild, serious, recovered, dead
    } = result
    return [
      date, hour, total, active, closed,
      mild, serious, recovered, dead
    ]
  }
}

async function addWorldData (rows) {
  // const rows = data.map(([
  //   date, hour, total, active, closed,
  //   mild, serious, recovered, dead
  // ]) => ({
  //   date, hour, total, active, closed,
  //   mild, serious, recovered, dead
  // }))
  // await knex.batchInsert('world', rows, 50)
  // await knex.transaction(transaction => transaction
  //   .insert(rows)
  //   .into('world'))
  await knex.transaction(transaction => {
    const promises = rows.map(row =>
      transaction
        .raw(`INSERT INTO world (
          date, hour, total, active, closed,
          mild, serious, recovered, dead
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )`, row))
    return Promise.all(promises)
  })
}

function hasCountriesTable () {
  return knex.schema.hasTable('countries')
}

function createCountriesTable () {
  return knex.schema.createTable('countries', table => {
    table.date('date').notNullable().index('countries_date')
    table.integer('hour').notNullable().index('countries_hour')
    table.string('country', 2).notNullable()
    table.integer('total').notNullable()
    table.integer('active').notNullable()
    table.integer('closed').notNullable()
    table.integer('mild').notNullable()
    table.integer('serious').notNullable()
    table.integer('recovered').notNullable()
    table.integer('dead').notNullable()
    table.primary(['date', 'hour', 'country'], 'countries_key')
    table.index(['date', 'hour'], 'countries_time')
    table.unique(['date', 'hour', 'country'], 'countries_location')
  })
}

async function ensureCountriesTable () {
  if (!await hasCountriesTable()) {
    await createCountriesTable()
  }
}

async function dropCountriesTable () {
  if (await hasCountriesTable()) {
    return knex.schema.dropTable('countries')
  }
}

async function getAllCountries () {
  const result = await knex
    .select()
    .from('countries')
    .first()
  if (result) {
    const {
      date, hour, country, total, active, closed,
      mild, serious, recovered, dead
    } = result
    return [
      date, hour, country, total, active, closed,
      mild, serious, recovered, dead
    ]
  }
}

async function addCountriesData (rows) {
  // const rows = data.map(([
  //   date, hour, country, total, active, closed,
  //   mild, serious, recovered, dead
  // ]) => ({
  //   date, hour, country, total, active, closed,
  //   mild, serious, recovered, dead
  // }))
  // await knex.batchInsert('countries', rows, 50)
  await knex.transaction(transaction => {
    const promises = rows.map(row =>
      transaction
        .raw(`INSERT INTO countries (
          date, hour, country, total, active, closed,
          mild, serious, recovered, dead
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`, row))
    return Promise.all(promises)
  })
}

function disconnectDatabase () {
  if (knex) {
    process.stderr.write('Disconnecting the database.\n')
    knex.destroy()
    knex = null
  }
}

// ensureWorldTable()
//   .then(() => addWorldData(data.world.data))
//   .catch(({ message }) => console.error(message))
//   .finally(() => disconnectDatabase())

// dropWorldTable()
//   .catch(({ message }) => console.error(message))
//   .finally(() => disconnectDatabase())

getAllWorld()
  .then(results => console.log(results))
  .catch(({ message }) => console.error(message))
  .finally(() => disconnectDatabase())

// ensureCountriesTable()
//   .then(() => addCountriesData(data.countries.data))
//   .catch(({ message }) => console.error(message))
//   .finally(() => disconnectDatabase())

// dropCountriesTable()
//   .catch(({ message }) => console.error(message))
//   .finally(() => disconnectDatabase())

// getAllCountries()
//   .then(results => console.log(results))
//   .catch(({ message }) => console.error(message))
//   .finally(() => disconnectDatabase())

function handleSignal () {
  process.stderr.write('\n')
  disconnectDatabase()
}

process
  .on('SIGTERM', handleSignal)
  .on('SIGINT', handleSignal)
