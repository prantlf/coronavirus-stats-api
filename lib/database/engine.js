const { getDatabaseType } = require('./type')
const {
  getLastStatement, disconnectDatabase
} = require(`./${getDatabaseType()}/engine`)

module.exports = { getLastStatement, disconnectDatabase }
