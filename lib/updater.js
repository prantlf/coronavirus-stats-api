const { updateWorld } = require('./update/world')
const { updateCountries } = require('./update/countries')
const { loadMainPage } = require('./loader')
const { getNow } = require('./update/date')

async function updateAll () {
  const now = getNow()
  const page = await loadMainPage()
  await updateWorld(page, now)
  await updateCountries(page, now)
  return now
}

module.exports = { updateAll }
