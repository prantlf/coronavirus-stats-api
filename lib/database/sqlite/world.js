const {
  prepareTransaction, prepareStatement, executeStatement,
  getAllData, getLatestData, getRangedData
} = require('./engine')

async function ensureWorldTable () {
  const createTable = `CREATE TABLE IF NOT EXISTS world (
    date DATE NOT NULL,
    hour TINYINT NOT NULL,
    total INT NOT NULL,
    active INT NOT NULL,
    closed INT NOT NULL,
    mild INT NOT NULL,
    serious INT NOT NULL,
    recovered INT NOT NULL,
    dead INT NOT NULL,
    PRIMARY KEY ( date, hour ),
    UNIQUE ( date, hour )
  ) WITHOUT ROWID`
  executeStatement(createTable)
  const createDateIndex = `CREATE INDEX IF NOT EXISTS
    date on world ( date ASC )`
  executeStatement(createDateIndex)
  const createTimeIndex = `CREATE INDEX IF NOT EXISTS
    time on world ( date ASC, hour ASC )`
  executeStatement(createTimeIndex)
}

async function addWorldData (rows) {
  const addData = `INSERT INTO world (
    date, hour, total, active, closed,
    mild, serious, recovered, dead
  ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )`
  const statement = prepareStatement(addData)
  const transaction = prepareTransaction(rows => {
    for (const row of rows) {
      statement.run(row)
    }
  })
  transaction(rows)
}

async function getAllWorldData () {
  return getAllData('world', '', [])
}

async function getLatestWorldData (limit) {
  return getLatestData('world', '', [], limit || 1)
}

async function getRangedWorldData (from, to, hour) {
  return getRangedData('world', '', [], from, to, hour)
}

module.exports = {
  ensureWorldTable,
  addWorldData,
  getAllWorldData,
  getLatestWorldData,
  getRangedWorldData
}
