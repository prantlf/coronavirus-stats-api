const { updateWorld } = require('./update/world')
const { updateCountries } = require('./update/countries')
const { getMainPage } = require('./source')

async function updateAll () {
  const page = await getMainPage()
  await updateWorld(page)
  await updateCountries(page)
}

module.exports = { updateAll }
