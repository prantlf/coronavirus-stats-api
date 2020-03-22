#!/usr/bin/env node

const { ensureDatabase } = require('../lib/database')
const { updateAll } = require('./updater')
const { getLastLog } = require('./database/engine')

let synchronizationTimer

async function updateAllSafely () {
  try {
    await updateAll()
  } catch (error) {
    const lastLog = getLastLog()
    process.stderr.write(`${lastLog}\n${error.message}\n`)
  }
}

function synchronizeData () {
  if (synchronizationTimer) {
    throw new Error('Synchronization has already started.')
  }
  ensureDatabase()
  updateAllSafely()
  synchronizationTimer = setInterval(updateAllSafely, 60 * 60 * 1000)
}

function stopSynchronization (exit) {
  if (synchronizationTimer) {
    if (!exit) {
      process.stderr.write('\n')
    }
    process.stderr.write('Stopping synchronization.\n')
    clearInterval(synchronizationTimer)
    synchronizationTimer = null
  }
  if (exit) {
    process.exit(0)
  }
}

process
  .on('SIGTERM', () => stopSynchronization(true))
  .on('SIGINT', () => stopSynchronization(false))

module.exports = { synchronizeData }
