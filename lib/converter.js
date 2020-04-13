const { getToday, getNextDay, getEndOfWeek, getNextWeek } = require('./date')
const { join } = require('path')
const { writeFile, ensurePath, checkFile } = require('./files')
const { getRangedWorldData } = require('./database/world')
const { getRangedCountryData } = require('./database/countries')
const { refreshCountries, getCountries } = require('./countries')

const dataDirectory = join(__dirname, '../data')
const firstDate = '2020-03-15'
const firstWeekDate = '2020-03-16'
let lastDate

async function convertWorldDay (date, update) {
  const file = join(dataDirectory, 'world', 'hourly-days', `${date}.json`)
  if (!update && await checkFile(file)) {
    return
  }
  await ensurePath(dataDirectory, 'world', 'hourly-days')
  const data = await getRangedWorldData(date, date)
  await writeFile(file, JSON.stringify(data))
}

async function convertWorldDays () {
  await ensurePath(dataDirectory, 'world')
  const file = join(dataDirectory, 'world', 'daily.json')
  const data = await getRangedWorldData(firstDate, lastDate, 'any')
  await writeFile(file, JSON.stringify(data))
}

async function convertWorldWeek (startDate, endDate, update) {
  const file = join(dataDirectory, 'world', 'hourly-weeks', `${startDate}.json`)
  if (!update && await checkFile(file)) {
    return
  }
  await ensurePath(dataDirectory, 'world', 'hourly-weeks')
  const data = await getRangedWorldData(startDate, endDate)
  await writeFile(file, JSON.stringify(data))
}

async function convertCountryDay (date, country, update) {
  const file = join(dataDirectory, 'countries', 'hourly-days', country, `${date}.json`)
  if (!update && await checkFile(file)) {
    return
  }
  await ensurePath(dataDirectory, 'countries', 'hourly-days', country)
  const data = await getRangedCountryData(country, date, date)
  await writeFile(file, JSON.stringify(data))
}

function convertCountriesDay (promises, date, update) {
  getCountries()
    .forEach(([, code]) => promises.push(convertCountryDay(date, code, update)))
}

async function convertCountryWeek (country, startDate, endDate, update) {
  const file = join(dataDirectory, 'countries', 'hourly-weeks', country, `${startDate}.json`)
  if (!update && await checkFile(file)) {
    return
  }
  await ensurePath(dataDirectory, 'countries', 'hourly-weeks', country)
  const data = await getRangedCountryData(country, startDate, endDate)
  await writeFile(file, JSON.stringify(data))
}

function convertCountriesWeek (promises, startDate, endDate, update) {
  getCountries()
    .forEach(([, code]) =>
      promises.push(convertCountryWeek(code, startDate, endDate, update)))
}

async function convertCountryDays (country) {
  await ensurePath(dataDirectory, 'countries', 'daily')
  const file = join(dataDirectory, 'countries', 'daily', `${country}.json`)
  const data = await getRangedCountryData(country, firstDate, lastDate, 'any')
  await writeFile(file, JSON.stringify(data))
}

function convertCountriesDays (promises) {
  getCountries()
    .forEach(([, code]) => promises.push(convertCountryDays(code)))
}

function convertAllDays (promises) {
  let currentDate = firstDate
  do {
    const update = currentDate === lastDate
    promises.push(convertWorldDay(currentDate, update))
    convertCountriesDay(promises, currentDate, update)
    currentDate = getNextDay(currentDate)
  } while (currentDate !== lastDate)
}

function convertAllWeeks (promises) {
  let currentDate = firstWeekDate
  do {
    const endOfWeek = getEndOfWeek(currentDate)
    const update = new Date(endOfWeek) >= new Date(lastDate)
    promises.push(convertWorldWeek(currentDate, endOfWeek, update))
    convertCountriesWeek(promises, currentDate, endOfWeek, update)
    currentDate = getNextWeek(currentDate)
  } while (new Date(currentDate) <= new Date(lastDate))
}

async function convertCountryList () {
  await ensurePath(dataDirectory, 'countries')
  const file = join(dataDirectory, 'countries', 'list.json')
  const data = getCountries()
  await writeFile(file, JSON.stringify(data))
}

async function convertAll () {
  process.stderr.write(`Converting data at ${new Date()}.\n`)
  lastDate = getToday()
  await refreshCountries()
  const promises = [convertCountryList(), convertWorldDays()]
  convertCountriesDays(promises)
  convertAllDays(promises)
  convertAllWeeks(promises)
  await Promise.all(promises)
}

module.exports = { convertAll }
