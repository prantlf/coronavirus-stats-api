const polkadot = require('polkadot')
const send = require('@polka/send-type')
const { handleRequest } = require('./handler')

function serveApi ({ port } = {}) {
  const app = polkadot(async (req, res) => {
    const { status, result } = handleRequest(req)
    send(res, status || 200, result)
  })

  port = +(process.env.PORT || 3000)
  app.listen(port, '0.0.0.0', error => {
    if (error) {
      process.stderr.write(`${error.message}\n`)
      process.exit(3)
    }
    process.stderr.write(`Listening on http://localhost:${port}.\n`)
  })
}

module.exports = { serveApi }
