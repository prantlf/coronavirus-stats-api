import sirv from 'sirv'
import polkadot from 'polkadot'
import compression from 'compression'
import * as sapper from '@sapper/server'
import { loop } from './util'

const { PORT, NODE_ENV } = process.env
const development = NODE_ENV === 'development'

const middleware = [
  compression({ threshold: 0 }),
  sirv('static', { dev: development }),
  sapper.middleware()
]

polkadot(async (request, response) => {
  request.originalUrl = request.url // for Sapper
  await loop(middleware, request, response)
})
.listen(PORT, '0.0.0.0', error => {
  if (error) {
    process.stderr.write(`${error.message}\n`)
    process.exit(1)
  }
  process.stderr.write(`Listening on http://localhost:${PORT}.\n`)
})
