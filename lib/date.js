const day = 24 * 60 * 60 * 1000

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

function getThisHour () {
  const now = new Date()
  return now.getUTCHours()
}

function getToday () {
  const now = new Date()
  return getDateString(now)
}

function getLastWeek () {
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 6 * day)
  return getDateString(lastWeek)
}

function getNextDay (date) {
  const thisDay = new Date(date)
  const nextDay = new Date(thisDay.getTime() + day)
  return getDateString(nextDay)
}

function getYesterday () {
  const thisDay = new Date()
  const yesterday = new Date(thisDay.getTime() - day)
  return getDateString(yesterday)
}

function getEndOfWeek (date) {
  const thisDay = new Date(date)
  const nextDay = new Date(thisDay.getTime() + 6 * day)
  return getDateString(nextDay)
}

function getNextWeek (date) {
  const thisDay = new Date(date)
  const nextDay = new Date(thisDay.getTime() + 7 * day)
  return getDateString(nextDay)
}

module.exports = {
  getDateString,
  getNow,
  getToday,
  getThisHour,
  getYesterday,
  getNextDay,
  getLastWeek,
  getNextWeek,
  getEndOfWeek
}
