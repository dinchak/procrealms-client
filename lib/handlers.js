const Conn = require('./conn')
const Log = require('./log')
const Prefs = require('./prefs')
const State = require('./state')
const U = require('./utils')
const UI = require('./ui')

exports.onEvent = function (cmd, msg) {
  Log.write(`<- cmd=${cmd}, msg=${msg ? JSON.stringify(msg).slice(0, 255) : ''}`)

  if (cmd == 'token.success') {
    Prefs.write({ name: msg.name, token: msg.token })
    Conn.send('terminal', { width: UI.getTerminalWidth(), height: UI.getTerminalHeight() })
    UI.hideLogin()
    UI.setInputMode()
    return
  }

  if (cmd == 'token.fail') {
    Prefs.remove()
    UI.showLogin('name')
    return
  }

  if (cmd == 'room.describe') {
    UI.addLine(msg.desc.trim())
    return
  }

  if (cmd == 'login.fail') {
    UI.showLogin('loginFailed')
    return
  }

  if (cmd == 'login.validationFailed') {
    UI.showLogin('validationFailed')
    return
  }

  if (cmd == 'login.nameExists') {
    UI.showLogin('password')
    return
  }

  if (cmd == 'login.nameAvailable') {
    UI.showLogin('choosePassword')
    return
  }

  if (cmd == 'out') {
    UI.addLine(U.parseAnsi(`{{Z` + msg.replace(/\s$/g, '')))
    return
  }

  if (cmd == 'welcome') {
    return
  }

  let matches = cmd.match(/^entity-(\d+)$/)
  if (matches) {
    State.entityCache[msg.eid] = msg
    Log.write(`received eid ${msg.eid}`)
    Conn.requestComplete(matches[1])
    UI.draw()
    return
  }

  matches = cmd.match(/^item-(\d+)$/)
  if (matches) {
    Log.write(`received iid ${msg.iid}`)
    Conn.requestComplete(matches[1])
    State.itemCache[msg.iid] = msg
    UI.draw()
    return
  }

  if (cmd == 'state.update') {
    for (let key in msg.remove) {
      delete State.state[key]
    }

    State.state = updateState(State.state, msg.update)

    const { room } = State.state

    if (room) {
      if (room.entities) {
        fetchEntities(room.entities)
      }
      if (room.items) {
        fetchItems(room.items)
      }
    }

    UI.draw()
  }
}

function updateState (state, update) {
  try {
    for (let key in update) {
      if (update[key] && typeof update[key] == 'object' && !Array.isArray(update[key])) {
        if (Object.keys(update[key]).length == 0) {
          state[key] = {}
        } else {
          state[key] = updateState(state[key] || {}, update[key])
        }
      } else {
        state[key] = update[key]
      }
    }
    return state
  } catch (err) {
    Log.write(err.stack)
  }
}

function fetchEntities (entities) {
  for (let eid of entities) {
    if (!State.entityCache[eid]) {
      Conn.fetchEntity(eid)
    }
  }
}

function fetchItems (items) {
  for (let iid of items) {
    if (!State.itemCache[iid]) {
      Conn.fetchItem(iid)
    }
  }
}
