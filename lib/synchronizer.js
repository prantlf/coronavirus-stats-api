#!/usr/bin/env node

const { ensureDatabase } = require('../lib/database')
const { updateAll } = require('./updater')
const { getLastLog } = require('./database/engine')

async function updateAllSafely () {
  try {
    await updateAll()
  } catch (error) {
    const lastLog = getLastLog()
    process.stderr.write(`${lastLog}\n${error.message}\n`)
  }
}

function synchronizeData () {
  ensureDatabase()
  updateAllSafely()
  setInterval(updateAllSafely, 60 * 60 * 1000)
}

module.exports = { synchronizeData }
