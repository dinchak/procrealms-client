const Conn = require('./lib/conn')
const UI = require('./lib/ui')

exports.init = function (program) {
  UI.init(program)
  Conn.init(onConnect)
}

function onConnect () {
  Conn.send('login', { name: 'Bignub', password: 'asd' })
}