const U = require('./utils')

exports.read = function () {
  if (U.inBrowser) {
  } else {
    return fsRead()
  }
}

exports.write = function (prefs) {
  if (U.inBrowser) {
  } else {
    fsWrite(prefs)
  }
}

exports.remove = function () {
  if (U.inBrowser) {
  } else {
    fsDelete()
  }
}

function fsRead () {
  const fs = require('fs')

  let prefsFile = getPrefsFilePath()
  if (!fs.existsSync(prefsFile)) {
    return false
  }

  let json = fs.readFileSync(prefsFile)
  let prefs = JSON.parse(json)
  return prefs
}

function fsWrite (prefs) {
  const fs = require('fs')
  let prefsFile = getPrefsFilePath()
  fs.writeFileSync(prefsFile, JSON.stringify(prefs))
}

function fsDelete () {
  const fs = require('fs')
  let prefsFile = getPrefsFilePath()
  if (fs.existsSync(prefsFile)) {
    fs.unlinkSync(prefsFile)
  }
}

function getPrefsFilePath () {
  const os = require('os')
  const path = require('path')
  return path.join(os.homedir(), '.procrealms.json')
}