const { updateWorld } = require('./update/world')
const { updateCountries } = require('./update/countries')
const { refreshCountries } = require('./countries')
const { loadMainPage } = require('./loader')
const { getNow } = require('./update/date')
const { formatArray } = require('./formatter')

async function updateAll () {
  const now = getNow()
  process.stderr.write(`Updating data at ${formatArray(now)}.\n`)
  const [page] = await Promise.all([
    loadMainPage(),
    refreshCountries()
  ])
  return Promise.all([
    updateWorld(page, now),
    updateCountries(page, now)
  ])
}

module.exports = { updateAll }
