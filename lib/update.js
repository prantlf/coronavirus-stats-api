const { updateWorld } = require('./update/world')
const { updateCountries } = require('./update/countries')
const { getMainPage } = require('./source')
const { getLastLog } = require('./database/engine')

async function updateAll () {
  try {
    const page = await getMainPage()
    await updateWorld(page)
    await updateCountries(page)
  } catch (error) {
    const lastLog = getLastLog()
    process.stderr.write(`${lastLog}\n${error.message}\n`)
  }
}

module.exports = { updateAll }
