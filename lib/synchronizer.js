#!/usr/bin/env node

const { ensureDatabase } = require('../lib/database')
const { updateAll } = require('./updater')
const { ensureCountries } = require('./countries')
const { printMessage } = require('./formatter')

let synchronizationTimer

async function updateAllSafely () {
  try {
    await updateAll()
  } catch ({ message }) {
    printMessage(message)
  }
}

async function startSynchronization () {
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
    process.exit(process.exitCode || 0)
  }
}

process
  .on('SIGTERM', () => stopSynchronization(true))
  .on('SIGINT', () => stopSynchronization(false))

module.exports = { startSynchronization }
