const Conn = require('./conn')
const State = require('./state')
const U = require('./utils')
const UI = require('./ui')

exports.onEvent = function (cmd, msg) {
  // UI.addLine(`cmd=${cmd}, msg=${JSON.stringify(msg)}`)
  if (cmd == 'out') {
    UI.addLine(U.parseAnsi(`{{Z` + msg.trim()))
  }

  let matches = cmd.match(/^entity-(\d+)$/)
  if (matches) {
    State.entityCache[msg.eid] = msg
    // UI.addLine(JSON.stringify(msg))
    UI.draw()
    return
  }

  matches = cmd.match(/^item-(\d+)$/)
  if (matches) {
    State.itemCache[msg.iid] = msg
    // UI.addLine(JSON.stringify(msg))
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
      fetchEntities(room.entities)
      fetchItems(room.items)
    }

    UI.draw()
  }
}

function updateState (state, update) {
  for (let key in update) {
    if (typeof update[key] == 'object' && !Array.isArray(update[key])) {
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
}

function fetchEntities (entities) {
  for (let eid of entities) {
    if (!State.entityCache[eid]) {
      Conn.send('entity', { eid })
    }
  }
}

function fetchItems (items) {
  for (let iid of items) {
    if (!State.itemCache[iid]) {
      Conn.send('item', { iid })
    }
  }
}
