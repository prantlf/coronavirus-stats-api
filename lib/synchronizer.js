#!/usr/bin/env node

const { ensureDatabase } = require('../lib/database')
const { updateAll } = require('./updater')
const { ensureCountries } = require('./countries')
const { getLastStatement } = require('./database/engine')

let synchronizationTimer

async function updateAllSafely () {
  try {
    await updateAll()
  } catch (error) {
    const lastStatement = getLastStatement()
    process.stderr.write(`${lastStatement}\n${error.message}\n`)
  }
}

async function synchronizeData () {
  if (synchronizationTimer) {
    throw new Error('Synchronization has already started.')
  }
  await Promise.all([ensureDatabase(), ensureCountries()])
  await updateAllSafely()
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
