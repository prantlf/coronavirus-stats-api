const polkadot = require('polkadot')
const send = require('@polka/send-type')
const { handleRequest } = require('./handler')
const { ensureCountries } = require('./countries')

async function startServer ({ port } = {}) {
  const app = polkadot(async (req, res) => {
    const { status, result } = await handleRequest(req)
    send(res, status || 200, result)
  })
  await ensureCountries()

  port = +(process.env.PORT || 3000)
  return new Promise((resolve, reject) => {
    app.listen(port, '0.0.0.0', error => {
      if (error) {
        return reject(error)
      }
      process.stderr.write(`Listening on http://localhost:${port}.\n`)
      resolve()
    })
  })
}

module.exports = { startServer }
