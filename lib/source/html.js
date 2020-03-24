const cheerio = require('cheerio')

function getFirstElement (page, selector) {
  const elements = page.find(selector)
  if (elements.length === 0) {
    throw new Error(`No elements found for "${selector}".`)
  }
  return elements.first()
}

function getElements (page, selector, expected) {
  const elements = page.find(selector)
  const actual = elements.length
  if (expected > 0 && expected !== actual) {
    throw new Error(
      `${actual} instead of ${expected} elements found for "${selector}".`)
  }
  return elements
    .toArray()
    .map(element => cheerio(element))
}

function getNumber (element) {
  return +element
    .text()
    .trim()
    .replace(/,/g, '')
    .replace(/^(\d+).*$/, '$1') || 0
}

function getText (element) {
  return element
    .text()
    .trim()
    .replace(/(?:\s|\r|\n)+/g, ' ')
}

module.exports = { getFirstElement, getElements, getNumber, getText }
