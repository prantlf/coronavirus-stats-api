const { getFirstElement, getElements, getNumber } = require('./html')

function getWorldSummary (page) {
  const body = page('body')
  const allTotal = getFirstElement(body, '.maincounter-number')
  const total = getNumber(allTotal)
  const caseTotals = getElements(body, '.number-table-main', 2)
  const [active, closed] = caseTotals.map(getNumber)
  const caseDetails = getElements(body, '.number-table', 4)
  const [mild, serious, recovered, dead] = caseDetails.map(getNumber)
  return [total, active, closed, mild, serious, recovered, dead]
}

module.exports = { getWorldSummary }
