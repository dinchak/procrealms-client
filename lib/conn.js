const Handlers = require('./handlers')
const Log = require('./log')
const U = require('./utils')

let ws

exports.init = (onConnect, onClose) => {
  let WebSocket
  
  onConnect = onConnect || function () {}

  if (U.inBrowser()) {
    WebSocket = window.WebSocket
    // ws = new WebSocket('ws://localhost:8001');
    ws = new WebSocket('ws://proceduralrealms.com:8000');
    ws.onopen = onConnect;
    ws.onclose = onClose;
    ws.onmessage = function (ev) {
      onMessage(ev.data)
    }
  } else {
    WebSocket = require('ws').WebSocket
    // ws = new WebSocket('ws://localhost:8001');
    ws = new WebSocket('ws://proceduralrealms.com:8000');
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
