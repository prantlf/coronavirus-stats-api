const { getLastLog } = require('./database/engine')

function formatArray (array) {
  return `${array}`.replace(/,/g, ', ')
}

function printOutput ({ result, status, error }) {
  if (status) {
    const lastLog = getLastLog()
    if (lastLog) {
      process.stderr.write(`${lastLog}\n`)
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
