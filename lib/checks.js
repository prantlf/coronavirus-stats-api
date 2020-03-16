const { getNow, getLastWeek } = require('./update/date')
const countries = require('../data/countries.json')

function checkCountry (value) {
  if (!value) {
    throw new RangeError('Country code missing.\n')
  }
  if (!countries.some(country => country[1] === value)) {
    throw new RangeError(`Country code "${value}" not recognized.\n`)
  }
}

function checkDate (type, value) {
  if (!value) {
    throw new RangeError(`${type} date missing.\n`)
  }
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) {
    throw new RangeError(`${type} date "${value}" malformed.\n`)
  }
}

function checkHour (value) {
  if (value < 0 || value > 23) {
    throw new RangeError(`Hour ${value} invalid.\n`)
  }
}

function checkRange (from, to, hour) {
  if (typeof from === 'object') {
    ({ from, to, hour } = from)
  }
  if (from) {
    checkDate('Start', from)
    if (!to) {
      to = getNow()[0]
    } else {
      checkDate('End', to)
    }
  } else if (to) {
    checkDate('End', to)
    from = getLastWeek()
  }
  if (hour !== undefined) {
    checkHour(hour)
    hour = +hour
  }
  return { from, to, hour }
}

function checkFlag (name, value) {
  if (value !== undefined) {
    if (value === '' || value === 'true' || value === true) {
      return true
    }
    if (value === 'false' || value === false) {
      return false
    }
    throw new RangeError(`Flag "${name}" invalid.\n`)
  }
  return false
}

function createRange (parameters, index) {
  const firstParameter = parameters[index + 0]
  return {
    from: firstParameter === 'latest' ? undefined : firstParameter,
    to: parameters[index + 1],
    hour: parameters[index + 2],
    latest: firstParameter === 'latest'
  }
}

module.exports = { checkCountry, checkRange, checkFlag, createRange }
