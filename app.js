const Conn = require('./lib/conn')
const Prefs = require('./lib/prefs')
const UI = require('./lib/ui')

let prefs = Prefs.read()

exports.init = function (program) {
  UI.init(program)
  Conn.init(onConnect, onClose)
}

function onConnect () {
  if (prefs) {
    Conn.send('token', { name: prefs.name, token: prefs.token })
  } else {
    UI.showLogin('name')
  }
}

function onClose () {
  Conn.init(onConnect, onClose)
}