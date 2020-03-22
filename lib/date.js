function getDateString (date) {
  return date
    .toISOString()
    .substring(0, 10)
}

function getNow () {
  const now = new Date()
  const date = getDateString(now)
  const hour = now.getUTCHours()
  return [date, hour]
}

function getLastWeek () {
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60)
  return getDateString(lastWeek)
}

module.exports = { getDateString, getNow, getLastWeek }
