const {
  prepareTransaction, prepareStatement, executeCommand,
  dropTable, getAllData, getLatestData, getRangedData
} = require('./engine')

async function ensureWorldTable () {
  executeCommand(`CREATE TABLE IF NOT EXISTS world (
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
  ) WITHOUT ROWID`)
  executeCommand(`CREATE INDEX IF NOT EXISTS
    world_date on world ( date ASC )`)
  executeCommand(`CREATE UNIQUE INDEX IF NOT EXISTS
    world_time on world ( date ASC, hour ASC )`)
}

async function dropWorldTable () {
  return dropTable('world')
}

async function addWorldData (rows) {
  const statement = prepareStatement(`INSERT INTO world (
    date, hour, total, active, closed,
    mild, serious, recovered, dead
  ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )`)
  const transaction = prepareTransaction(rows => {
    for (const row of rows) {
      statement.run(row)
    }
  })
  return transaction(rows)
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
  dropWorldTable,
  addWorldData,
  getAllWorldData,
  getLatestWorldData,
  getRangedWorldData
}
