const Blessed = require('@dinchak/blessed')

const State = require('../state')

exports.create = function (screen) {
  let component = Blessed.box({
    name: 'input_caret',
    top: screen.height - 1,
    left: 0,
    height: 1,
    width: 2,
    content: '> ',
    style: {
      fg: 'yellow',
      bg: 'black',
      bold: true
    }
  })

  component.on('prerender', () => prerender(component, screen))

  return component
}

function prerender (component, screen) {
  if (State.mode == 'input') {
    component.style.fg = 'yellow'
  } else {
    component.style.fg = 'black'
  }
}
