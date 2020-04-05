const { ensureDatabase } = require('./database')
const { ensureCountries } = require('./countries')
const { handleRequest } = require('./handler')
const isOutdatedBrowser = require('./is-outdated-browser')
const { join } = require('path')
const polkadot = require('polkadot')
const sendObject = require('@polka/send-type')
const sendFile = require('send')

let server

async function startServer ({ port } = {}) {
  await Promise.all([ensureDatabase(), ensureCountries()])

  const root = join(__dirname, '..')
  const polka = polkadot(async (request, response) => {
    const path = request.path
    if (path === '/') {
      response.writeHead(302, { location: '/pages/index.html' })
      return response.end()
    }
    if (path.startsWith('/pages/index.html') &&
        isOutdatedBrowser(request.headers['user-agent'])) {
      response.writeHead(302, { location: '/pages/outdated-browser.html' })
      return response.end()
    }
    if (path.startsWith('/pages') || path.startsWith('/data')) {
      return new Promise(resolve => {
        sendFile(request, path, { index: false, root })
          .once('end', () => resolve())
          .pipe(response)
      })
    }
    const { status, result } = await handleRequest(request)
    sendObject(response, status || 200, result)
  })

  port = +(process.env.PORT || 3000)
  return new Promise((resolve, reject) => {
    server = polka.listen(port, '0.0.0.0', error => {
      if (error) {
        return reject(error)
      }
      process.stderr.write(`Listening on http://localhost:${port}.\n`)
      resolve()
    })
  })
}

function stopServer () {
  if (server) {
    process.stderr.write('Stopping server.\n')
    server.close(() => process.exit(process.exitCode || 0))
    server = null
  }
}

process
  .on('SIGTERM', stopServer)
  .on('SIGINT', stopServer)

module.exports = { startServer }
