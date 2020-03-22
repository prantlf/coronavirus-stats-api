require('dotenv').config()

const type = process.env.DATABASE_TYPE || 'sqlite'

function getDatabaseType () {
  return type
}

module.exports = { getDatabaseType }
