const {
  beginTransaction, executeTransaction, executeCommand,
  hasIndex, dropTable, getAllData, getLatestData, getRangedData
} = require('./engine')

async function ensureWorldTable () {
  await executeCommand(`CREATE TABLE IF NOT EXISTS world (
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
  )`)
  if (!await hasIndex('world', 'world_date')) {
    await executeCommand(`CREATE INDEX
      world_date on world ( date ASC )`)
  }
  if (!await hasIndex('world', 'world_time')) {
    await executeCommand(`CREATE UNIQUE INDEX
     world_time on world ( date ASC, hour ASC )`)
  }
}

async function dropWorldTable () {
  return dropTable('world')
}

async function addWorldData (rows) {
  const transaction = await beginTransaction()
  try {
    await Promise.all(rows.map(row =>
      executeTransaction(transaction, `INSERT INTO world (
        date, hour, total, active, closed,
        mild, serious, recovered, dead
      ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )`, row)))
    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
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
