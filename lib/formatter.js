const { getLastStatement } = require('./database/engine')

function formatArray (array) {
  return `${array}`.replace(/,/g, ', ')
}

function printLastStatement () {
  const lastStatement = getLastStatement()
  if (lastStatement) {
    process.stderr.write(`${lastStatement}\n`)
  }
}

function printMessage (message, exitCode) {
  process.stderr.write(`${message}\n`)
  printLastStatement()
  if (exitCode !== undefined) {
    process.exitCode = exitCode
  }
}

function printResult ({ result, status }) {
  if (status) {
    printMessage(result.error, status < 500 ? 1 : 2)
  } else {
    const { columns, data } = result
    console.log('columns:', formatArray(columns))
    console.log('data:')
    for (let i = 0; i < data.length; ++i) {
      console.log(formatArray(data[i]))
    }
  }
}

function printError (error) {
  printMessage(error.message, error instanceof RangeError ? 1 : 2)
}

module.exports = { formatArray, printResult, printError, printMessage }
