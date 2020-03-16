const { updateWorld } = require('./update/world')
const { updateCountries } = require('./update/countries')
const { loadMainPage } = require('./loader')
const { getNow } = require('./update/date')
const { formatArray } = require('./formatter')

async function updateAll () {
  const now = getNow()
  process.stderr.write(`Updating data at ${formatArray(now)}.\n`)
  const page = await loadMainPage()
  await updateWorld(page, now)
  await updateCountries(page, now)
  return now
}

module.exports = { updateAll }
