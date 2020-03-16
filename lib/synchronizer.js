#!/usr/bin/env node

const { ensureDatabase } = require('../lib/database')
const { updateAll } = require('./updater')
const { getLastLog } = require('./database/engine')
const { formatArray } = require('./formatter')

async function updateAllSafely () {
  try {
    const now = await updateAll()
    process.stderr.write(`Updated data at ${formatArray(now)}.\n`)
  } catch (error) {
    const lastLog = getLastLog()
    process.stderr.write(`${lastLog}\n${error.message}\n`)
  }
}

function synchronizeData () {
  ensureDatabase()
  setInterval(updateAllSafely, 60 * 60 * 1000)
}

module.exports = { synchronizeData }
