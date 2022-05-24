const U = require('./utils')

exports.read = function () {
  if (U.inBrowser()) {
    return browserRead()
  } else {
    return fsRead()
  }
}

exports.write = function (prefs) {
  if (U.inBrowser()) {
    browserWrite(prefs)
  } else {
    fsWrite(prefs)
  }
}

exports.remove = function () {
  if (U.inBrowser()) {
    browserDelete()
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

function browserRead () {
  try {
    let json = document.cookie.replace(/^prefs=/, '')
    if (!json) {
      return false
    }
    return JSON.parse(json)
  } catch (err) {
    return false
  }
}

function fsWrite (prefs) {
  const fs = require('fs')
  let prefsFile = getPrefsFilePath()
  fs.writeFileSync(prefsFile, JSON.stringify(prefs))
}

function browserWrite (prefs) {
  document.cookie = `prefs=${JSON.stringify(prefs)}; path=/; max-age=${60*60*24*14};`
}

function fsDelete () {
  const fs = require('fs')
  let prefsFile = getPrefsFilePath()
  if (fs.existsSync(prefsFile)) {
    fs.unlinkSync(prefsFile)
  }
}

function browserDelete () {
  document.cookie = `prefs=xxx; path=/; max-age=0;`
}

function getPrefsFilePath () {
  const os = require('os')
  const path = require('path')
  return path.join(os.homedir(), '.procrealms.json')
}