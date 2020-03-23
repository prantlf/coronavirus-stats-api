const { getNow, getLastWeek } = require('./date')
const { getCountries } = require('./countries')

function checkCountry (value) {
  if (!value) {
    throw new RangeError('Country code missing.')
  }
  const countries = getCountries()
  if (!countries.some(country => country[1] === value)) {
    throw new RangeError(`Country code "${value}" not recognized.`)
  }
}

function checkDate (type, value) {
  if (!value) {
    throw new RangeError(`${type} date missing.`)
  }
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) {
    throw new RangeError(`${type} date "${value}" malformed.`)
  }
}

function checkHour (value) {
  if (value < 0 || value > 23) {
    throw new RangeError(`Hour ${value} invalid.`)
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
    throw new RangeError(`Flag "${name}" invalid.`)
  }
  return false
}

function createRange (parameters, index) {
  const firstParameter = parameters[index + 0]
  return {
    from: firstParameter === 'latest' || firstParameter === 'all'
      ? undefined : firstParameter,
    to: parameters[index + 1],
    hour: parameters[index + 2],
    latest: firstParameter === 'latest',
    all: firstParameter === 'all'
  }
}

module.exports = { checkCountry, checkRange, checkFlag, createRange }
