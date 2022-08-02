const Blessed = require('@dinchak/blessed')

const U = require('../utils')

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
  {{w[Press {{Yany key{{w to close]

  {{WCommand Mode{{w

    {{wPress {{YENTER{{w to enter {{WCommand Mode{{w and enter commands
    {{wPress {{YESCAPE{{w to enter {{WHotkey Mode{{w, reactivating quick keys
    {{wPress {{YUP{{w and {{YDOWN{{w to scroll through command history

  {{WHotkey Mode{{w

    {{wSome Hotkeys will be available in certain situations, such as {{W[{{YA{{W]ttack{{w, {{W[{{YH{{W]arvest{{w, etc.
    {{wPress {{YUP{{w and {{YDOWN{{w to scroll through the game log
    {{wPress {{YCTRL-C{{w to exit the program

  {{WBasic Movement{{w

    q {{YW{{w e    {{wUse the {{YWASD{{w keys for basic {{Wnorth{{w, {{Wsouth{{w, {{Weast{{w, {{Wwest{{w movement
    {{YA S D    {{wUse {{YQ{{w, {{YE{{w, {{YZ{{w, and {{YC{{w to move {{Wnw{{w, {{Wne{{w, {{Wsw{{w, and {{Wse{{w
    {{wz x c    {{wUse {{YX{{w to {{Wenter{{w a portal or building

  {{WQuick Slots{{w

    {{wPress {{Y1{{w - {{Y9{{w to activate the corresponding Quick Slot
    {{wUse the {{Yslot{{w command to assign Quick Slots (see {{Yhelp slot{{w for more info)
`))
}