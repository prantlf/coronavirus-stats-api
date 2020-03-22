const { getDatabaseType } = require('./type')

module.exports = require(`./${getDatabaseType()}/countries`)
