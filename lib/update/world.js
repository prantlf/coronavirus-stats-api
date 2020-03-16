const { addWorldData } = require('../database/world')
const { getWorldSummary } = require('../source/world')
const { getNow } = require('./date')

async function updateWorld (page) {
  const summary = getWorldSummary(page)
  const now = getNow()
  const fullSummary = now.concat(summary)
  addWorldData(fullSummary)
}

module.exports = { updateWorld }
