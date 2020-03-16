function getNow () {
  const now = new Date()
  const date = now
    .toISOString()
    .substring(0, 10)
  const hour = now.getUTCHours()
  return [date, hour]
}

function getLastWeek () {
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60)
  return lastWeek
    .toISOString()
    .substring(0, 10)
}

module.exports = { getNow, getLastWeek }
