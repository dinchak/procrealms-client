const Conn = require('./lib/conn')
const Log = require('./lib/log')
const Prefs = require('./lib/prefs')
const U = require('./lib/utils')
const UI = require('./lib/ui')

let prefs = Prefs.read()

exports.init = function (program) {
  UI.init(program)
  Conn.init(onConnect, onClose)
  if (!U.inBrowser()) {
    process.on('uncaughtException', function (err) {
      Log.write(err.stack)
    })
  }
}

function onConnect () {
  if (prefs) {
    Conn.send('token', { name: prefs.name, token: prefs.token })
  } else {
    UI.showLogin('name')
  }
}

function onClose () {
  Prefs.remove()
  // UI.setCommandMode()
  Conn.init(onConnect, onClose)
}