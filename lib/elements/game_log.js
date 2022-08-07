const Blessed = require('@dinchak/blessed')
const QuickSlots = require('./quick_slots')

exports.create = function (screen) {
  let component = Blessed.log({
    name: 'log',
    top: 0,
    left: 31,
    alwaysScroll: true,
    scrollback: 1000,
    mouse: true,
    keys: true,
    height: screen.height - 2,
    width: screen.width - 31,
    style: {
      fg: 'white',
      bg: 'black'
    }
  })

  screen.on('resize', () => resize(component, screen))
  component.on('prerender', () => prerender(component, screen))

  return component
}

function resize (component, screen) {
  component.height = screen.height - QuickSlots.getHeight() - 1
  component.width = screen.width - 31
}

function prerender (component, screen) {
  component.height = screen.height - QuickSlots.getHeight() - 1
}