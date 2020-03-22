require('dotenv').config()

const type = process.env.DATABASE_TYPE || 'sqlite'
process.stderr.write(`Using the database driver "${type}".\n`)

function getDatabaseType () {
  return type
}

module.exports = { getDatabaseType }
