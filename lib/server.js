const { ensureCountries } = require('./countries')
const { handleRequest } = require('./handler')
const polkadot = require('polkadot')
const send = require('@polka/send-type')

let server

async function startServer ({ port } = {}) {
  await ensureCountries()

  const app = polkadot(async (req, res) => {
    const { status, result } = await handleRequest(req)
    send(res, status || 200, result)
  })

  port = +(process.env.PORT || 3000)
  return new Promise((resolve, reject) => {
    server = app.listen(port, '0.0.0.0', (error, server) => {
      if (error) {
        return reject(error)
      }
      process.stderr.write(`Listening on http://localhost:${port}.\n`)
      resolve()
    })
  })
}

function stopServer (exit) {
  if (server) {
    process.stderr.write('Stopping server.\n')
    server.close()
    server = null
  }
  if (exit) {
    process.exit(process.exitCode || 0)
  }
}

process
  .on('SIGTERM', () => stopServer(true))
  .on('SIGINT', () => stopServer(false))

module.exports = { startServer }
