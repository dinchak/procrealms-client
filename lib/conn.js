const Handlers = require('./handlers')
const Log = require('./log')
const U = require('./utils')

let ws

exports.url = 'ws://proceduralrealms.com:8000'
if (process && process.env.NODE_ENV == 'dev') {
  exports.url = 'ws://localhost:8001'
}

exports.timeout = 5
exports.attempt = 0

let pendingRequests = {}

exports.init = (onConnect, onClose, onError) => {
  let WebSocket

  onConnect = onConnect || function () {}

  exports.attempt++

  if (U.inBrowser()) {
    WebSocket = window.WebSocket
    ws = new WebSocket(exports.url)
    ws.onopen = onConnect
    ws.onclose = onClose
    ws.onmessage = function (ev) {
      onMessage(ev.data)
    }
    ws.onerror = onError
  } else {
    WebSocket = require('ws').WebSocket
    ws = new WebSocket(exports.url)
    ws.off('open', onConnect).on('open', onConnect)
    ws.off('message', onMessage).on('message', onMessage)
    ws.off('close', onClose).on('close', onClose)
    ws.off('error', onError).on('error', onError)
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

exports.fetchEntity = (eid) => {
  let requestId = `entity-${eid}`
  if (pendingRequests[requestId]) {
    return
  }
  pendingRequests[requestId] = true
  exports.send('entity', { eid })
}

exports.fetchItem = (iid) => {
  let requestId = `item-${iid}`
  if (pendingRequests[requestId]) {
    return
  }
  pendingRequests[requestId] = true
  exports.send('item', { iid })
}

exports.requestComplete = function (requestId) {
  Log.write(`completed request ${requestId}`)
  delete pendingRequests[requestId]
}