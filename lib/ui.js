const Blessed = require('blessed')

const BattleStatus = require('./elements/battle_status')
const Conn = require('./conn')
const GameLog = require('./elements/game_log')
const Help = require('./elements/help')
const Input = require('./elements/input')
const Log = require('./log')
const Login = require('./elements/login')
const PlayerStatus = require('./elements/player_status')
const QuickSlots = require('./elements/quick_slots')
const RoomStatus = require('./elements/room_status')
const State = require('./state')
const U = require('./utils')

let screen
let gameLog
let roomStatus
let battleStatus
let playerStatus
let quickSlots
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
  playerStatus = PlayerStatus.create(screen)
  quickSlots = QuickSlots.create(screen)
  input = Input.create(screen)

  help = Help.create(screen)
  login = Login.create(screen)

  screen.append(gameLog)
  screen.append(roomStatus)
  screen.append(battleStatus)
  screen.append(playerStatus)
  screen.append(quickSlots)
  screen.append(input)

  screen.append(help)
  screen.append(login)

  screen.key(['C-c'], function () {
    Log.write('received ctrl-c, closing')
    return process.exit(0)
  })

  screen.on('resize', function () {
    Conn.send('terminal', { width: exports.getTerminalWidth(), height: exports.getTerminalHeight() })
    screen.render()
  })

  screen.on('keypress', function (ch, key) {
    // hack to prevent double events in browser
    if (key.isTrusted) {
      return
    }

    if (State.mode == 'command') {
      if (key.name == 'enter') {
        exports.setInputMode()
        return
      }
      quickSlots.emit('keypress', ch, key)
    }

    if (State.mode == 'login') {
      login.emit('keypress', ch, key)
    }

    if (State.mode == 'help') {
      if (key.name == 'escape') {
        exports.hideHelp()
      }
    }
  })

  screen.render()
}

exports.draw = function () {
  const { battle } = State.state

  if (battle && battle.active) {
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
}

exports.runCommand = function (cmd) {
  exports.addLine(U.parseAnsi(`{{w> {{Y${cmd}`))
  Conn.send('cmd', cmd)
}

exports.setCommandMode = function () {
  // exports.addLine('setCommandMode()')
  State.mode = 'command'
  if (input.focused) {
    screen.focusPop()
  }
  screen.render()
}

exports.setInputMode = function () {
  // exports.addLine('setInputMode()')
  State.mode = 'input'
  if (!input.focused) {
    Log.write(`input.focus()`)
    input.focus()
  }
  // if (!input._reading) {
    Log.write(`input.readInput()`)
    input.readInput()
  // }
  screen.render()
}

exports.getTerminalWidth = function () {
  return screen.width
}

exports.getTerminalHeight = function () {
  return screen.height - 10
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