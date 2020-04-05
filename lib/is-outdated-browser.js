function isOutdatedBrowser (userAgent = '') {
  return /\b(?:MSIE |Trident\/|Edge\/)/.test(userAgent)
}

module.exports = isOutdatedBrowser
