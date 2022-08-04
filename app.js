const Conn = require('./lib/conn')
const Log = require('./lib/log')
const Prefs = require('./lib/prefs')
const State = require('./lib/state')
const U = require('./lib/utils')
const UI = require('./lib/ui')

let prefs = Prefs.read()

exports.init = function (program) {
  UI.init(program)
  UI.showLogin('connecting')
  Conn.init(onConnect, onClose, onError)
  if (!U.inBrowser()) {
    process.on('uncaughtException', function (err) {
      Log.write(err.stack)
    })
  }
}

function onConnect () {
  Conn.attempt = 0
  if (prefs) {
    Conn.send('token', { name: prefs.name, token: prefs.token })
  } else {
    UI.showLogin('name')
  }
}

function onClose () {
  Prefs.remove()
  UI.showLogin('connectFailed')
  State.state = {}
  State.entityCache = {}
  State.itemCache = {}
  setTimeout(() => Conn.init(onConnect, onClose, onError), Conn.timeout * 1000)
}

function onError (err) {
  UI.showLogin('connectFailed')
  Log.write(err.stack)
}