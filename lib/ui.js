const Blessed = require('@dinchak/blessed')

const BattleStatus = require('./elements/battle_status')
const Conn = require('./conn')
const GameLog = require('./elements/game_log')
const Help = require('./elements/help')
const Input = require('./elements/input')
const InputCaret = require('./elements/input_caret')
const Log = require('./log')
const Login = require('./elements/login')
const QuickSlots = require('./elements/quick_slots')
const RoomStatus = require('./elements/room_status')
const State = require('./state')
const U = require('./utils')

let screen
let gameLog
let roomStatus
let battleStatus
let quickSlots
let inputCaret
let input

let help
let login

exports.init = function (program) {
  screen = Blessed.screen({
    fastCSR: true,
    cursor: {
      artificial: true,
      shape: 'block',
      color: 'yellow',
      blink: true
    },
    program
  })

  gameLog = GameLog.create(screen)
  roomStatus = RoomStatus.create(screen)
  battleStatus = BattleStatus.create(screen)
  quickSlots = QuickSlots.create(screen)
  inputCaret = InputCaret.create(screen)
  input = Input.create(screen)

  help = Help.create(screen)
  login = Login.create(screen)

  screen.append(gameLog)
  screen.append(roomStatus)
  screen.append(battleStatus)
  screen.append(quickSlots)
  screen.append(inputCaret)
  screen.append(input)

  screen.append(help)
  screen.append(login)

  if (!U.inBrowser()) {
    screen.key(['C-c'], function () {
      Log.write('received ctrl-c, closing')
      return process.exit(0)
    })
  }

  screen.on('resize', function () {
    Conn.send('terminal', { width: exports.getTerminalWidth(), height: exports.getTerminalHeight() })
    screen.render()
  })

  screen.on('mouse', function () {
    if (!input.focused && State.mode == 'input') {
      exports.setCommandMode()
    }
  })

  screen.on('keypress', function (ch, key) {
    // exports.addLine(`UI.onKey() ch=${ch} key=${JSON.stringify(key)}`)

    // hack to prevent double events in browser
    if (key.isTrusted) {
      return
    }

    if (State.mode == 'login') {
      login.emit('keypress', ch, key)
      screen.render()
      return
    }

    if (State.mode == 'help') {
      exports.addLine('hide help')
      exports.hideHelp()
      screen.render()
      return
    }

    if (State.mode == 'command' || !input.focused) {
      if (key.name == 'enter') {
        exports.setInputMode()
        return
      }
      quickSlots.emit('keypress', ch, key)
      screen.render()
      return
    }
  })
}

exports.draw = function () {
  const { battle } = State.state

  if (battle && battle.active) {
    battleStatus.emit('resize')
    battleStatus.show()
    roomStatus.hide()
  } else {
    roomStatus.show()
    battleStatus.hide()
  }

  screen.render()
}

exports.addLine = function (line) {
  let autoScroll = true
  if (gameLog.getScroll() != gameLog.getScrollHeight() - 1) {
    autoScroll = false
  }

  // line += ` getScroll=${log.getScroll()}, getScrollHeight=${log.getScrollHeight()}, autoScroll=${autoScroll}`
  gameLog.add(line)

  if (autoScroll) {
    gameLog.scrollTo(gameLog.getScrollHeight())
  }

  // allows scrolling with arrow keys
  // console.log('focus game log')
  if (State.mode == 'command') {
    gameLog.focus()
  }
}

exports.runCommand = function (cmd) {
  exports.addLine(U.parseAnsi(`{{w> {{Y${cmd}`))
  gameLog.scrollTo(gameLog.getScrollHeight())
  Conn.send('cmd', cmd)
}

exports.setCommandMode = function () {
  Log.write(`setCommandMode()`)
  State.mode = 'command'
  if (input.focused) {
    screen.focusPop()
  }
  gameLog.focus()
  screen.render()
}

exports.setInputMode = function () {
  Log.write(`setInputMode()`)
  State.mode = 'input'
  if (!input.focused) {
    Log.write(`input.focus()`)
    input.focus()
  }
  Log.write(`input.readInput()`)
  input.readInput()
  screen.render()
}

exports.getTerminalWidth = function () {
  return screen.width - 30
}

exports.getTerminalHeight = function () {
  return screen.height - 2
}

exports.showHelp = function () {
  State.mode = 'help'
  help.show()
  screen.render()
}

exports.hideHelp = function () {
  State.mode = 'command'
  help.hide()
  screen.render()
}

exports.showLogin = function (loginStep) {
  State.mode = 'login'
  Login.setLoginStep(loginStep)
  login.show()
  screen.render()
}

exports.hideLogin = function () {
  State.mode = 'command'
  Login.setLoginStep('token')
  login.hide()
  screen.focusPop()
  screen.render()
}
