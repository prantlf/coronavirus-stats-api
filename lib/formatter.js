const { getLastStatement } = require('./database/engine')

function formatArray (array) {
  return `${array}`.replace(/,/g, ', ')
}

function printOutput ({ result, status, error }) {
  if (status) {
    const lastStatement = getLastStatement()
    if (lastStatement) {
      process.stderr.write(`${lastStatement}\n`)
    }
    process.stderr.write(`${error}\n`)
    process.exit(3)
  } else {
    const { columns, data } = result
    console.log('columns:', formatArray(columns))
    console.log('data:')
    for (let i = 0; i < data.length; ++i) {
      console.log(formatArray(data[i]))
    }
  }
}

module.exports = { formatArray, printOutput }
