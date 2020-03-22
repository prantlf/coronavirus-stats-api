const { addWorldData } = require('../database/world')
const { getWorldSummary } = require('../source/world')

async function updateWorld (page, now) {
  const summary = getWorldSummary(page)
  const fullSummary = now.concat(summary)
  await addWorldData([fullSummary])
}

module.exports = { updateWorld }
