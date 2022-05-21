const Handlers = require('./handlers')

let ws

exports.init = (onConnect, onClose) => {
  let WebSocket
  
  onConnect = onConnect || function () {}

  if (typeof window != 'undefined') {
    WebSocket = window.WebSocket
    ws = new WebSocket('ws://localhost:8001')
    ws.onopen = onConnect;
    ws.onclose = onClose;
    ws.onmessage = function (ev) {
      onMessage(ev.data)
    }
  } else {
    WebSocket = require('ws').WebSocket
    ws = new WebSocket('ws://localhost:8001')
    ws.on('open', onConnect)
    ws.on('message', onMessage)
    ws.on('close', onClose)
  }

  return onConnect
}

exports.send = (cmd, msg) => {
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
