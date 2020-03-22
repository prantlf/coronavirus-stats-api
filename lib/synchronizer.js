#!/usr/bin/env node

const { ensureDatabase, disconnectDatabase } = require('./database')
const { updateAll } = require('./updater')
const { ensureCountries } = require('./countries')
const { printMessage } = require('./formatter')
const { getNow } = require('./date')

let synchronizer
let lastHour

async function updateAllSafely () {
  const thisHour = getNow()[1]
  if (lastHour === thisHour) {
    return
  }
  lastHour = thisHour
  try {
    await updateAll()
  } catch ({ message }) {
    printMessage(message)
    lastHour = null
  }
}

async function startSynchronization () {
  if (synchronizer) {
    throw new Error('Synchronization has already started.')
  }
  await Promise.all([ensureDatabase(), ensureCountries()])
  await updateAllSafely()
  synchronizer = setInterval(updateAllSafely, 10 * 60 * 1000)
}

function stopSynchronization (exit) {
  if (synchronizer) {
    process.stderr.write('Stopping synchronization.\n')
    clearInterval(synchronizer)
    synchronizer = null
    disconnectDatabase()
  }
  if (exit) {
    process.exit(process.exitCode || 0)
  }
}

process
  .on('SIGTERM', () => stopSynchronization(true))
  .on('SIGINT', () => stopSynchronization(false))

module.exports = { startSynchronization }
