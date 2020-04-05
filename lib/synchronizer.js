#!/usr/bin/env node

const { ensureDatabase, disconnectDatabase } = require('./database')
const { updateAll } = require('./updater')
const { convertAll } = require('./converter')
const { ensureCountries } = require('./countries')
const { printMessage } = require('./formatter')
const { getThisHour } = require('./date')

let synchronizer
let lastHour

async function updateAllSafely () {
  try {
    await updateAll()
  } catch ({ message }) {
    printMessage(message)
    lastHour = null
  }
}

async function convertAllSafely () {
  try {
    await convertAll()
  } catch ({ message }) {
    printMessage(message)
    lastHour = null
  }
}

async function synchronizeAllSafely () {
  const thisHour = getThisHour()
  if (lastHour === thisHour) {
    return
  }
  lastHour = thisHour
  await updateAllSafely()
  await convertAllSafely()
}

async function startSynchronization () {
  if (synchronizer) {
    throw new Error('Synchronization has already started.')
  }
  await Promise.all([ensureDatabase(), ensureCountries()])
  synchronizeAllSafely()
  synchronizer = setInterval(synchronizeAllSafely, 10 * 60 * 1000)
}

function stopSynchronization () {
  if (synchronizer) {
    process.stderr.write('Stopping synchronization.\n')
    clearInterval(synchronizer)
    synchronizer = null
    disconnectDatabase()
  }
}

process
  .on('SIGTERM', stopSynchronization)
  .on('SIGINT', stopSynchronization)

module.exports = { startSynchronization }
