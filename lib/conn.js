const Handlers = require('./handlers')

let ws

exports.init = (onConnect) => {
  let WebSocket
  
  onConnect = onConnect || function () {}

  if (typeof window != 'undefined') {
    WebSocket = window.WebSocket
    ws = new WebSocket('ws://localhost:8001')
    ws.onopen = onConnect;
    ws.onmessage = function (ev) {
      onMessage(ev.data)
    }
  } else {
    WebSocket = require('ws').WebSocket
    ws = new WebSocket('ws://localhost:8001')
    ws.on('open', onConnect)
    ws.on('message', onMessage)
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