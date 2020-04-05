const now = new Date()
const from = '2020-03-15'
const to = formatDate(now)
let countries
let country
let weeks = []
let week
const availableCases = [
  'total', 'active', 'closed', 'mild', 'serious', 'recovered', 'dead'
]
let selectedCases
let displayedCases
let chart
let router
let refreshCases

// Common chart configuration

const chartistPlugins = [
  Chartist.plugins.legend({
    position: 'bottom'
  }),
  Chartist.plugins.ctAxisTitle({
    axisX: {
      axisTitle: 'Day',
      offset: { x: 0, y: 50 },
      textAnchor: 'middle'
    },
    axisY: {
      axisTitle: 'Cases [thousands]',
      offset: { x: 0, y: 0 },
      textAnchor: 'middle'
    }
  }),
  Chartist.plugins.tooltip({
    tooltipFnc: (label, value) => `${label}: ${formatNumber(value)}`,
    appendToBody: true
  })
]

const chartistOptions = {
  chartPadding: { top: 20, bottom: 30, left: 40, right: 0 },
  fullWidth: true,
  lineSmooth: Chartist.Interpolation.cardinal({
    tension: 0,
    fillHoles: true
  }),
  axisY: {
    labelInterpolationFnc: value => formatNumber(value)
  },
  plugins: chartistPlugins
}

// Date and number formatting, date computation

function parseDate (date) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  return Date.UTC(+parts[1], +parts[2], +parts[3], 0, 0, 0)
}

function formatDate (date) {
  return new Date(date)
    .toISOString()
    .substring(0, 10)
}

function formatNumber (number) {
  number = +number
  // number = Math.round(number / 1000)
  if (number !== parseInt(number)) {
    return ''
  }
  const text = number.toString()
  return number < 1000 ? text :
    `${text.slice(0, text.length - 3)},${text.slice(text.length - 3)}`
}

function getMonday (date) {
  date = new Date(date)
  let today = date.getUTCDay()
  const daysBack = today === 0 ? 6 : today - 1
  date.setUTCDate(date.getUTCDate() - daysBack)
  return date
}

function getSunday (date) {
  date = new Date(date)
  let today = date.getUTCDay()
  const daysForth = today === 0 ? 0 : 7 - today
  date.setUTCDate(date.getUTCDate() + daysForth)
  return date
}

function getNextDay (date) {
  return new Date(date.getTime() + 24 * 60 * 60 * 1000)
}

// Serialization and deserialization or URL parameters

function serializeParameters (parameters) {
  let query
  for (const name in parameters) {
    let value = parameters[name]
    if (Array.isArray(value)) {
      value = value.join(',')
    }
    const entry = `${name}=${value}`
    if (query) {
      query += `&${entry}`
    } else  {
      query = `?${entry}`
    }
  }
  return query || ''
}

const splitParameters = /([^=&]+)(?:=([^&]*))?/g

function deserializeParameters () {
  const query = location.search.substr(1)
  const parameters = {}
  let entry
  while ((entry = splitParameters.exec(query))) {
    const [, name, value] = entry
    parameters[name] = value.includes(',') ? value.split(',') : value
  }
  return parameters
}

// Rendering of form controls

// function renderCountries(countryList) {
//   const list = document.getElementById('country-list')
//   for (const [name, code] of countryList) {
//     const option = document.createElement('option')
//     option.setAttribute('data-code', code)
//     option.textContent = name
//     list.appendChild(option)
//   }
//   countries = countryList
// }

function renderCountries(countryList) {
  const list = document.getElementById('countries')
  for (const [name] of countryList) {
    const option = document.createElement('option')
    option.textContent = name
    list.appendChild(option)
  }
  countries = countryList
}

function renderWeeks() {
  const list = document.getElementById('weeks')
  let currentDate = '2020-03-16'
  do {
    const startDate = getMonday(currentDate)
    const endDate = getSunday(currentDate)
    const startDateText = formatDate(startDate)
    const endDateText = formatDate(endDate)
    const week = `${startDateText} - ${endDateText}`
    weeks.push([ startDateText, endDateText ])
    const option = document.createElement('option')
    option.textContent = week
    list.appendChild(option)
    currentDate = getNextDay(endDate)
  } while (currentDate < now)
}

// Error handling

function renderError (error) {
  const place = document.getElementById('chart')
  place.textContent = error.message
  place.classList.add('error')
}

// Logging

function log (...parameters) {
  // console.log(...parameters)
}

// Rendering of charts

function createChart (chartData, chartOptions, responsiveOptions) {
  log('creating chart')
  return new Chartist.Line('#chart', chartData, chartOptions, responsiveOptions)
}

function destroyChart () {
  log('destroying chart')
  chart.detach()
  document
    .getElementById('chart')
    .innerHTML = ''
}

function restoreCases () {
  log('chart created')
  setTimeout(() => {
    chart.off('created', restoreCases)
    if (displayedCases != selectedCases) {
      displayedCases = selectedCases
      if (selectedCases) {
        selectCases(selectedCases)
      }
    }
    chart.on('created', () => {
      log('chart updated')
      displayedCases = selectedCases = getSelectedCases()
      refreshCases()
    })
  })
}

function ensureChart (chartData, chartOptions, responsiveOptions) {
  if (chart) {
    selectedCases = getSelectedCases()
    displayedCases = null
    destroyChart()
  }
  chart = createChart(chartData, chartOptions, responsiveOptions)
  chart.on('created', restoreCases)
}

function renderDailyChart ({ columns, data }) {
  let startDate = parseDate(data[0][0])
  let endDate = parseDate(data[data.length - 1][0])
  let length = parseInt((endDate - startDate) / 1000 / 60 / 60 / 24) + 1
  const labels = data.map(data => data[0])
  const firstMeasurement = columns[2] === 'country' ? 3 : 2
  const series = Array.from({ length: 7 }, (item, kind) => {
    kind += firstMeasurement
    const counts = data.map(data => data[kind])
    return { name: columns[kind], data: counts }
  })
  const chartData = { labels, series }
  const chartOptions = {
    ...chartistOptions,
    axisX: {
      labelInterpolationFnc: (value, index) => index >= length ? '' :  value
    }
  }
  const responsiveOptions = [
    ['screen and (max-width: 640px)', {
      axisX: {
        labelInterpolationFnc: (value, index) =>
          index >= length || index % 2 !== 0 ? '' :  value
      }
    }]
  ]
  document
    .getElementById('chart')
    .classList.remove('thin-points')
  ensureChart(chartData, chartOptions, responsiveOptions)
}

function renderHourlyChart ({ columns, data }) {
  let startDate = parseDate(data[0][0])
  let endDate = parseDate(data[data.length - 1][0])
  let length = parseInt((endDate - startDate) / 1000 / 60 / 60) + 1
  const labels = Array.from({ length }, (item, index) => {
    const day = formatDate(startDate + index * 60 * 60 * 1000)
    return `${day}\n${index % 24}:00`
  })
  let lastMeasurement = length - 1
  const firstMeasurement = columns[2] === 'country' ? 3 : 2
  const series = Array.from({ length: 7 }, (item, kind) => {
    const counts = Array.from({ length })
    let day = 0
    let lastHour
    kind += firstMeasurement
    for (let measurement = 0; measurement < data.length; ++measurement) {
      const hour = data[measurement][1]
      if (hour < lastHour) {
        day += 24
      }
      counts[day + hour] = data[measurement][kind]
      lastHour = hour
    }
    while (counts[lastMeasurement] === undefined) {
      --lastMeasurement
    }
    return { name: columns[kind], data: counts }
  })
  const rest = length - lastMeasurement
  labels.splice(lastMeasurement, rest)
  series.forEach(({ data }) => { data.splice(lastMeasurement, rest) })
  length = lastMeasurement
  const chartData = { labels, series }
  const chartOptions = {
    ...chartistOptions,
    axisX: {
      labelInterpolationFnc: (value, index) => {
        return index > length ? ''
          : value === '' ? formatDate(endDate)
          : value.endsWith('\n0:00')
            ? value.slice(0, value.length - 5) : ''
      }
    }
  }
  const responsiveOptions = [
    ['screen and (max-width: 767px)', {
      axisX: { showGrid: false }
    }]
  ]
  document
    .getElementById('chart')
    .classList.add('thin-points')
  ensureChart(chartData, chartOptions, responsiveOptions)
  // chart.on('draw', data => {
  //   if(data.type === 'line' || data.type === 'area') {
  //     data.element.animate({
  //       d: {
  //         begin: 250 * data.index,
  //         dur: 250,
  //         from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
  //         to: data.path.clone().stringify(),
  //         easing: Chartist.Svg.Easing.easeOutQuint
  //       }
  //     })
  //   }
  // })
}

// Listening on changes of form fields and chart legend

function listenToCountries (refresh) {
  document
    .getElementById('countries')
    .addEventListener('change', ({ target }) => {
      country = countries[target.selectedIndex - 1]
      refresh()
    })
// document
//   .getElementById('country-select')
//   .addEventListener('change', ({ target }) => {
//     const value = { target }
//     const code = countries.find(([ name, code ]) => name == value)
//     const url = code ? `/api/countries?country=cz&from=${from}&to=${to}`
//       : `/api/world?from=${from}&to=${to}`
//     fetch(url)
//       .then(checkResponse)
//       .then(renderChart)
//       .catch(renderError)
//   })
}

function listenToWeeks (refresh) {
  document
    .getElementById('weeks')
    .addEventListener('change', ({ target }) => {
      week = weeks[target.selectedIndex - 1]
      refresh()
    })
}

function listenToCases (refresh) {
  refreshCases = refresh
}

// Fetching data from the server

function createTimeout (timeout) {
  const controller = new AbortController()
  let timeoutHandler = setTimeout(() => controller.abort(), timeout * 1000)
  return {
    signal: controller.signal,
    cancel: response => {
      clearTimeout(timeoutHandler)
      return response
    }
  }
}

function checkStatus (response) {
  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`)
  }
  return response
}

function fetchCountries () {
  log('fetching countries')
  const { signal, cancel } = createTimeout(60)
  fetch('/data/countries/list.json', { signal })
    .then(cancel)
    .then(checkStatus)
    .then(response => response.json())
    .then(renderCountries)
    .then(() => updateCountrySelector(country))
    .catch(renderError)
}

function getDataUrl ({ country, from, hour }) {
  // const query = serializeParameters(parameters)
  // return country ? `/api/countries${query}` : `/api/world${query}`
  if (country) {
    if (hour === 'any') {
      return `/data/countries/daily/${country}.json`
    }
    return `/data/countries/hourly-weeks/${country}/${from}.json`
  }
  if (hour === 'any') {
    return `/data/world/daily.json`
  }
  return `/data/world/hourly-weeks/${from}.json`
}

function fetchData (parameters) {
  log('fetching data')
  const url = getDataUrl(parameters)
  const renderChart = week ? renderHourlyChart : renderDailyChart
  const { signal, cancel } = createTimeout(60)
  fetch(url, { signal })
    .then(cancel)
    .then(checkStatus)
    .then(response => response.json())
    .then(renderChart)
    .catch(renderError)
}

// Creating URL path router and uprating window location

function createRouter (handler) {
  router = new window.router.Router();
  router.always(handler)
}

function updateLocation (query) {
  if (location.search !== query) {
    router.pushState(`${location.origin}${location.pathname}${query}`)
    return true
  }
}

// Updating form fields from URL parameters

function updateCountry (newCountry) {
  const oldCountry = country
  if (countries) {
    updateCountrySelector(newCountry)
  } else {
    country = newCountry && ['', newCountry]
  }
  return !(oldCountry == country || (Array.isArray(oldCountry) &&
    Array.isArray(country) && oldCountry[1] === country[1]))
}

function updateCountrySelector (newCountry) {
  if (!countries) {
    return
  }
  const countryCode = Array.isArray(newCountry) ? newCountry[1] : newCountry
  const countryIndex = countries.findIndex(country => country[1] === countryCode)
  country = countries[countryIndex]
  document
    .getElementById('countries')
    .selectedIndex = countryIndex + 1
}

function updateWeek (newFromTo) {
  const [newFrom, newTo] = newFromTo || []
  let newWeek = newFrom && [formatDate(getMonday(newFrom)), formatDate(getSunday(newTo))]
  const oldWeek = week
  updateWeekSelector(newWeek)
  return !(oldWeek == week || (Array.isArray(oldWeek) &&
    Array.isArray(week) && oldWeek[0] === week[0]))
}

function updateWeekSelector (newWeek) {
  const newFrom = newWeek && newWeek[0]
  const weekIndex = weeks.findIndex(week => week[0] === newFrom)
  week = weeks[weekIndex]
  document
    .getElementById('weeks')
    .selectedIndex = weekIndex + 1
}

// Updating case visibility using the chart legend

function getChartLegend () {
  return document
    .getElementById('chart')
    .getElementsByTagName('li')
}

function getSelectedCases () {
  const legend = getChartLegend()
  let cases = []
  for (let i = 0, length = legend.length; i < length; ++i) {
    if (!legend[i].classList.contains('inactive')) {
      cases.push(availableCases[i])
    }
  }
  return cases.length === 0 || cases.length === availableCases.length ? null : cases
}

function selectCases (cases) {
  const legend = getChartLegend()
  for (let i = 0, length = legend.length; i < length; ++i) {
    if (!cases.includes(availableCases[i])) {
      clickElement(legend[i])
    }
  }
}

function clickElement (element) {
  var event = new MouseEvent('click', {
    isTrusted: true,
    bubbles: true,
    cancelable: true,
    view: window
  });
  return element.dispatchEvent(event);
}

function updateCases (newCases) {
  if (selectedCases != newCases) {
    const oldCases = selectedCases
    selectedCases = newCases
    return Array.isArray(oldCases) !== Array.isArray(selectedCases) ||
      oldCases.length !== selectedCases.length ||
      oldCases.some((oldCase, index) => oldCase !== selectedCases[index])
  }
}
