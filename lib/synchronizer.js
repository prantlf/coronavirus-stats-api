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

process.on('SIGINT', () => {
  if (synchronizationTimer) {
    process.stderr.write('Stopping synchronization.\n')
    clearInterval(synchronizationTimer)
  }
})

module.exports = { synchronizeData }
