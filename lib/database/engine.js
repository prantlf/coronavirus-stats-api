const { getDatabaseType } = require('./type')
const { getLastStatement } = require(`./${getDatabaseType()}/engine`)

module.exports = { getLastStatement }
