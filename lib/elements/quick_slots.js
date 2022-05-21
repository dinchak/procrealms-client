const Blessed = require('blessed')

const State = require('../state')
const U = require('../utils')
const UI = require('../ui')

exports.create = function (screen) {
  let component = Blessed.box({
    name: 'quickslots',
    top: screen.height - 2,
    left: 0,
    height: 1,
    keys: false,
    content: 'quickslots',
    width: '100%',
    style: {
      fg: 'white',
      bg: 'gray'
    }
  })

  screen.on('resize', () => resize(component, screen))

  component.on('keypress', (ch, key) => onKey(component, screen, ch, key))  
  component.on('prerender', () => prerender(component, screen))

  return component
}

function onKey (component, screen, ch, key) {
  // UI.addLine(`Quickslots.onKey() ch=${ch} key=${JSON.stringify(key)}`)
  const { slots } = State.state

  let slot = slots.find(sl => sl.slot == ch)
  if (slot) {
    UI.runCommand(slot.slot)
    return
  }

  // WASD movement
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

}

function resize (component, screen) {
  component.top = screen.height - 2
  component.width = screen.width
}

function prerender (component, screen) {
  const { slots, skills } = State.state

  if (!slots || !Object.keys(slots).length) {
    component.setContent('')
    return
  }

  let out = ''
  for (let { slot, label } of slots) {
    if (out) {
      out += ' '
    }
    let color = '{{W'
    let keyColor = '{{Y'
    if (State.mode != 'command') {
      keyColor = '{{w'
      color = '{{w'
    }
    let skill = skills.find(sk => sk.name == label)
    if (skill && skill.timeLeft) {
      color = '{{w'
      keyColor = '{{w'
    }
    out += `{{w[${keyColor}${slot}{{w] ${color}${label}`
  }

  component.setContent(U.parseAnsi(out))
}
