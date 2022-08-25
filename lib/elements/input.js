const Blessed = require('@dinchak/blessed')

const State = require('../state')
const UI = require('../ui')

const history = []
let historyIndex = -1

exports.create = function (screen) {
  let component = Blessed.textbox({
    name: 'input',
    top: screen.height - 1,
    left: 33,
    height: 1,
    width: screen.width - 33,
    keys: false,
    width: '100%-2',
    style: {
      fg: 'white',
      bg: 'black',
      focus: {
        fg: 'brightyellow',
        bg: 'black',
      }
    }
  })

  component.on('keypress', (ch, key) => onKey(component, screen, ch, key))
  screen.on('resize', () => resize(component, screen))

  return component
}

function onKey (component, screen, ch, key) {
  if (key.name == 'enter') {
    let cmd = component.getValue()

    if (!cmd) {
      setTimeout(() => UI.setInputMode())
      return
    }

    history.unshift(cmd)
    historyIndex = -1

    UI.runCommand(cmd)
    component.clearValue()

    process.nextTick(() => component.readInput())
    return
  }

  if (key.name == 'escape') {
    UI.setCommandMode()
    return
  }

  if (key.name == 'up') {
   if (historyIndex + 1 < history.length) {
      historyIndex++
      component.setValue(history[historyIndex])
    }
    screen.render()
  }

  if (key.name == 'down') {
    historyIndex--
    if (historyIndex <= -1) {
      component.setValue('')
      historyIndex = -1
      screen.render()
      return
    }
    component.setValue(history[historyIndex])
    screen.render()
  }
}

function resize (component, screen) {
  component.top = screen.height - 1
  component.width = screen.width - 33
}