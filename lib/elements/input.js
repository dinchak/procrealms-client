const Blessed = require('blessed')

const UI = require('../ui')

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
}

function resize (component, screen) {
  component.top = screen.height - 1
  component.width = screen.width
}