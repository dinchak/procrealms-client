const Blessed = require('@dinchak/blessed')

const State = require('../state')
const U = require('../utils')

exports.create = function (screen) {
  let component = Blessed.box({
    name: 'player',
    top: screen.height - 3,
    left: 0,
    height: 1,
    keys: false,
    content: 'quickslots',
    width: '100%',
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
  component.top = screen.height - 3
  component.width = screen.width
}

function prerender (component, screen) {
  const { player, room } = State.state

  if (!player || !room) {
    return
  }

  let roomStatus = `{{)L{{W${room.level} {{M${room.x}{{w, {{M${room.y} {{K| ${room.name}{{w `

  let hpBar = U.renderBar(
    `${player.hp} HP`,
    player.hp,
    player.maxHp,
    15,
    ['{{W{{2', '{{W{{2', '{{W{{2', '{{W{{2', '{{W{{2'],
    true
  )

  let enBar = U.renderBar(
    `${player.energy} EN`,
    player.energy,
    player.maxEnergy,
    15,
    ['{{W{{4', '{{W{{4', '{{W{{4', '{{W{{4', '{{W{{4'],
    true
  )

  let stBar = U.renderBar(
    `${player.stamina} ST`,
    player.stamina,
    player.maxStamina,
    15,
    ['{{W{{5', '{{W{{5', '{{W{{5', '{{W{{5', '{{W{{5'],
    true
  )

  let foodBar = U.renderBar(
    `${player.food} Food`,
    player.food,
    player.maxFood,
    15,
    ['{{W{{2', '{{W{{2', '{{W{{2', '{{W{{2', '{{W{{2'],
    true
  )

  let comboBar = U.renderBar(
    `${player.combo} Combo`,
    player.combo,
    100,
    10,
    ['{{W{{3', '{{W{{3', '{{W{{3', '{{W{{3', '{{W{{3'],
    true
  )

  let rageBar = U.renderBar(
    `${player.rage} Rage`,
    player.rage,
    100,
    10,
    ['{{W{{1', '{{W{{1', '{{W{{1', '{{W{{1', '{{W{{1'],
    true
  )

  let xpBar = U.renderBar(
    `${player.xpForNextLevel - player.xp} XP TNL`,
    player.xp - player.xpForCurrentLevel,
    player.xpForNextLevel - player.xpForCurrentLevel,
    30,
    ['{{W{{6', '{{W{{6', '{{W{{6', '{{W{{6', '{{W{{6'],
    true
  )

  let spacer = screen.width -
    U.numVisibleChars(roomStatus) - 
    15 - 15 - 15 - 15 - 10 - 10 - 30
  let out = hpBar + enBar + stBar + foodBar + comboBar + rageBar + xpBar + '{{Z' + ' '.repeat(Math.max(0, spacer)) + roomStatus

  component.setContent(U.parseAnsi(out))
}
