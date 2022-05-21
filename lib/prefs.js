exports.read = function () {
  if (typeof window == 'undefined') {
    return fsRead()
  } else {
    return false
  }
}

exports.write = function (prefs) {
  if (typeof window == 'undefined') {
    fsWrite(prefs)
  } else {
    return false
  }
}

function fsRead () {
  const fs = require('fs')
  const os = require('os')
  const path = require('path')

  let prefsFile = path.join(os.homedir(), '.procrealms.json')
  if (!fs.existsSync(prefsFile)) {
    return false
  }

  let json = fs.readFileSync(prefsFile)
  let prefs = JSON.parse(json)
  return prefs
}

function fsWrite (prefs) {
  const fs = require('fs')
  const os = require('os')
  const path = require('path')

  let prefsFile = path.join(os.homedir(), '.procrealms.json')
  fs.writeFileSync(prefsFile, JSON.stringify(prefs))
}
