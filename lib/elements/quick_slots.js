const Blessed = require('@dinchak/blessed')

const Conn = require('../conn')
const Log = require('../log')
const State = require('../state')
const U = require('../utils')
const UI = require('../ui')

let quickSlotHeight = 1

exports.create = function (screen) {
  let component = Blessed.box({
    name: 'quickslots',
    top: screen.height - 2,
    width: screen.width - 31,
    left: 31,
    height: 1,
    keys: false,
    content: '',
    width: '100%',
    style: {
      fg: 'white',
      bg: 'black'
    }
  })

  screen.on('resize', () => resize(component, screen))

  component.on('keypress', (ch, key) => onKey(component, screen, ch, key))
  component.on('prerender', () => prerender(component, screen))

  return component
}

exports.getHeight = function () {
  return quickSlotHeight
}

function onKey (component, screen, ch, key) {
  // UI.addLine(`Quickslots.onKey() ch=${ch} key=${JSON.stringify(key)}`)
  const { battle, slots } = State.state

  if (slots) {
    let slot = slots.find(sl => sl.slot == ch)
    if (slot) {
      UI.runCommand(slot.slot)
      return
    }
  }

  // WASD movement
  if (battle && battle.active) {
    if (ch == 'a') {
      UI.runCommand('attack')
      return
    }
    if (ch == 'd') {
      UI.runCommand('defend')
      return
    }
    if (ch == 'f') {
      UI.runCommand('flee')
      return
    }
    if (ch == '~') {
      Log.write(JSON.stringify(State.state, null, 2))
    }
  } else {
    if (ch == 'w') {
      UI.runCommand('north')
      return
    }
    if (ch == 'a') {
      UI.runCommand('west')
      return
    }
    if (ch == 's') {
      UI.runCommand('south')
      return
    }
    if (ch == 'd') {
      UI.runCommand('east')
      return
    }
    if (ch == 'q') {
      UI.runCommand('northwest')
      return
    }
    if (ch == 'e') {
      UI.runCommand('northeast')
      return
    }
    if (ch == 'z') {
      UI.runCommand('southwest')
      return
    }
    if (ch == 'c') {
      UI.runCommand('southeast')
      return
    }
    if (ch == 'x') {
      UI.runCommand('enter')
      return
    }
    if (ch == 'b') {
      UI.runCommand('battle')
      return
    }
    if (ch == 'h') {
      UI.runCommand('harvest')
      return
    }
    if (ch == 'l') {
      UI.runCommand('loot')
      return
    }
    if (ch == '?') {
      UI.showHelp()
      return
    }
    if (ch == '~') {
      Log.write(JSON.stringify(State.state, null, 2))
    }
  }

  if (key.full == 'C-s') {
    UI.addLine(U.parseAnsi(U.objectToString(State.state)))
    return
  }
}

function resize (component, screen) {
  component.top = screen.height - 2
  component.width = screen.width - 31
}

function prerender (component, screen) {
  const { battle, slots, skills } = State.state

  let out = ''

  if (battle && battle.active) {
    out += renderHotkey('A', 'ttack', battle.myTurn && State.mode == 'command') + ' '
    out += renderHotkey('D', 'efend', battle.myTurn && State.mode == 'command') + ' '
    out += renderHotkey('F', 'lee', battle.myTurn && State.mode == 'command')
  } else {
    if (canStartBattle()) {
      if (out) {
        out += ' '
      }
      out += renderHotkey('B', 'attle', State.mode == 'command')
    }
    if (canHarvest()) {
      if (out) {
        out += ' '
      }
      out += renderHotkey('H', 'arvest', State.mode == 'command')
    }
    if (canLoot()) {
      if (out) {
        out += ' '
      }
      out += renderHotkey('L', 'oot', State.mode == 'command')
    }
  }

  if (slots && Object.keys(slots).length) {
    for (let { slot, label } of slots) {
      if (out.length > 0) {
        let remainingSpace = (screen.width - 31) - (U.stripColorCodes(out).length % (screen.width - 31))
        if (remainingSpace < label.length + 4) {
          out += '\n'
        } else {
          out += ' '
        }
      }
      let active = true
      if (battle && battle.active) {
        active = battle.myTurn
      }
      let skill = skills.find(sk => sk.name == label)
      if (skill && skill.timeLeft) {
        active = false
      }
      out += renderHotkey(slot, ` ${label}`, active && State.mode == 'command')
    }
  }

  if (!out) {
    out += '{{KNo quick actions{{0'
  }

  let screenWidth = screen.width - 31
  let barWidth = U.stripColorCodes(out).length
  quickSlotHeight = Math.ceil(barWidth / screenWidth)

  component.height = quickSlotHeight
  component.top = screen.height - 1 - quickSlotHeight

  component.setContent(U.parseAnsi(out))
}

function renderHotkey (key, label, active) {
  if (active) {
    return `{{W[{{Y${key}{{W]${label}`
  } else {
    return `{{K[${key}]${label}`
  }
}

function canStartBattle () {
  const { room } = State.state
  if (!room) {
    return false
  }

  for (let eid of room.entities) {
    let entity = State.entityCache[eid]
    if (!entity) {
      Conn.fetchEntity(eid)
      continue
    }
    if (entity.traits.includes('evil')) {
      return true
    }
  }

  return false
}

function canHarvest () {
  const { room } = State.state
  if (!room) {
    return false
  }

  for (let iid of room.items) {
    let item = State.itemCache[iid]
    if (!item) {
      Conn.fetchItem(iid)
      continue
    }
    if (item.type == 'resource' && item.subtype != 'chest') {
      return true
    }
  }

  return false
}

function canLoot () {
  const { room } = State.state
  if (!room) {
    return false
  }

  for (let iid of room.items) {
    let item = State.itemCache[iid]
    if (!item) {
      Conn.fetchItem(iid)
      continue
    }
    if (item.type == 'resource' && item.subtype == 'chest') {
      return true
    }
  }

  return false
}