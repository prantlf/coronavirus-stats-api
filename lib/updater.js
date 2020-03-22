const { updateWorld } = require('./update/world')
const { updateCountries } = require('./update/countries')
const { refreshCountries } = require('./countries')
const { loadMainPage } = require('./loader')
const { getNow } = require('./date')
const { formatArray } = require('./formatter')

let updating

async function updateAll () {
  if (!updating) {
    updating = new Promise((resolve, reject) =>
      performUpdate()
        .then(resolve)
        .catch(reject)
        .finally(() => { updating = null }))
  }
  return updating
}

async function performUpdate () {
  const now = getNow()
  process.stderr.write(`Updating data at ${formatArray(now)}.\n`)
  const [page] = await Promise.all([loadMainPage(), refreshCountries()])
  await Promise.all([updateWorld(page, now), updateCountries(page, now)])
  return now
}

module.exports = { updateAll }
