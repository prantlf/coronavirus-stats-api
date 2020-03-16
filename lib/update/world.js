const { addWorldData } = require('../database/world')
const { getWorldSummary } = require('../source/world')

async function updateWorld (page, now) {
  const summary = getWorldSummary(page)
  const fullSummary = now.concat(summary)
  addWorldData(fullSummary)
}

module.exports = { updateWorld }
