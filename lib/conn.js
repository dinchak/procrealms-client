const Handlers = require('./handlers')
const Log = require('./log')
const U = require('./utils')

let ws
let url = 'ws://localhost:8001'
if (process.env.NODE_ENV == 'production') {
  url = 'ws://proceduralrealms.com:8000'
}

exports.init = (onConnect, onClose) => {
  let WebSocket

  onConnect = onConnect || function () {}

  if (U.inBrowser()) {
    WebSocket = window.WebSocket
    ws = new WebSocket(url)
    ws.onopen = onConnect
    ws.onclose = onClose
    ws.onmessage = function (ev) {
      onMessage(ev.data)
    }
  } else {
    WebSocket = require('ws').WebSocket
    ws = new WebSocket(url)
    ws.off('open', onConnect).on('open', onConnect)
    ws.off('message', onMessage).on('message', onMessage)
    ws.off('close', onClose).on('close', onClose)
  }

  return onConnect
}

exports.send = (cmd, msg) => {
  Log.write(`-> ${cmd} ${msg ? JSON.stringify(msg) : ''}`)
  let out = JSON.stringify({ cmd, msg })
  ws.send(out)
}

function onMessage (json) {
  try {
    let { cmd, msg } = JSON.parse(json)
    Handlers.onEvent(cmd, msg)
  } catch (err) {
    console.log('error parsing message: %s', json)
    console.log(err.stack)
  }
}
