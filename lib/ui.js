const Blessed = require('blessed')

const Conn = require('./conn')
const GameLog = require('./elements/game_log')
const Input = require('./elements/input')
const PlayerStatus = require('./elements/player_status')
const QuickSlots = require('./elements/quick_slots')
const RoomStatus = require('./elements/room_status')
const State = require('./state')
const U = require('./utils')

let screen
let gameLog
let roomStatus
let playerStatus
let quickSlots
let input

exports.init = function (program) {
  screen = Blessed.screen({
    smartCSR: true,
    program
  })

  gameLog = GameLog.create(screen)
  roomStatus = RoomStatus.create(screen)
  playerStatus = PlayerStatus.create(screen)
  quickSlots = QuickSlots.create(screen)
  input = Input.create(screen)

  screen.append(gameLog)
  screen.append(roomStatus)
  screen.append(playerStatus)
  screen.append(quickSlots)
  screen.append(input)

  screen.key(['C-c'], function () {
    return process.exit(0)
  })

  screen.key(['enter'], function () {
    if (screen.focused.name != 'input') {
      exports.setInputMode()
    }
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
      quickSlots.emit('keypress', ch, key)
    }
  })

  screen.render()
}

exports.draw = function () {
  // exports.addLine(`UI.draw()`)
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
  screen.focusPop()
}

exports.setInputMode = function () {
  // exports.addLine('setInputMode()')
  State.mode = 'input'
  input.focus()
  input.readInput()
}

exports.getTerminalWidth = function () {
  return screen.width
}

exports.getTerminalHeight = function () {
  return screen.height - 10
}