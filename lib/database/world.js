const { getDatabaseType } = require('./type')

module.exports = require(`./${getDatabaseType()}/world`)
