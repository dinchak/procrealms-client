const Blessed = require('@dinchak/blessed')

exports.create = function (screen) {
  let component = Blessed.log({
    name: 'log',
    top: 0,
    left: 0,
    alwaysScroll: true,
    scrollback: 1000,
    mouse: true,
    keys: true,
    height: screen.height - 10,
    style: {
      fg: 'white',
      bg: 'black'
    }
  })

  screen.on('resize', () => resize(component, screen))

  return component
}

function resize (component, screen) {
  component.height = screen.height - 10
  component.width = screen.width
}