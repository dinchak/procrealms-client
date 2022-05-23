const Blessed = require('blessed')

const U = require('../utils')
const UI = require('../ui')

exports.create = function (screen) {
  let component = Blessed.box({
    name: 'help',
    top: 0,
    left: 0,
    label: 'Help',
    height: '100%',
    width: '100%',
    border: {
      type: 'line'
    },
    style: {
      fg: 'lightwhite',
      bg: 'blue',
      border: {
        fg: 'lightyellow'
      }
    }
  })

  component.hide()

  component.on('prerender', () => prerender(component, screen))

  return component
}

function prerender (component, screen) {
  component.setContent(U.parseAnsi(`
  {{w[Press {{YESCAPE{{w to close]

  {{WInput Mode{{w

    {{wPress {{YENTER{{w to enter {{WInput Mode{{w and enter commands
    {{wPress {{YESCAPE{{w to leave {{WInput Mode{{w, reactivating quick keys

  {{WBasic Movement{{w

    q {{YW{{w e    {{wUse the {{YWASD{{w keys for basic north, south, east, west movement
    {{YA S D    {{wUse {{YQ{{w, {{YE{{w, {{YZ{{w, and {{YC{{w to move nw, ne, sw, and se
    {{wz x c    {{wUse {{YX{{w to enter

  {{WQuick Slots{{w

    {{wPress {{Y1{{w - {{Y9{{w to activate the corresponding Quick Slot
    {{wUse the {{Yslot{{w command to assign Quick Slots (see {{Yhelp slot{{w for more info)
`))
}