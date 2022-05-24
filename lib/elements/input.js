const Blessed = require('blessed')

const UI = require('../ui')

const history = []
let historyIndex = -1

exports.create = function (screen) {
  let component = Blessed.textbox({
    name: 'input',
    top: screen.height - 1,
    left: 0,
    height: 1,
    keys: false,
    width: '100%',
    style: {
      fg: 'white',
      bg: 'gray',
      focus: {
        fg: 'brightyellow',
        bg: 'gray',
      }
    }
  })

  component.on('keypress', (ch, key) => onKey(component, screen, ch, key))
  screen.on('resize', () => resize(component, screen))

  return component
}

function onKey (component, screen, ch, key) {
  // UI.addLine(`key() ch=${ch} key=${JSON.stringify(key)}`)

  if (key.name == 'enter') {
    let cmd = component.getValue()

    if (!cmd) {
      UI.setCommandMode()
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
    // UI.addLine('input escape focusPop')
    UI.setCommandMode()
    return
  }

  if (key.name == 'up') {
    UI.addLine(`historyIndex=${historyIndex}`)
    if (historyIndex + 1 < history.length) {
      historyIndex++
      component.setValue(history[historyIndex])
    }
  }

  if (key.name == 'down') {
    UI.addLine(`historyIndex=${historyIndex}`)
    historyIndex--
    if (historyIndex == -1) {
      component.setValue('')
      return
    }
    component.setValue(history[historyIndex])
  }
}

function resize (component, screen) {
  component.top = screen.height - 1
  component.width = screen.width
}