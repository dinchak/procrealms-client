const Blessed = require('@dinchak/blessed')
const Conn = require('../conn')
const State = require('../state')
const U = require('../utils')

exports.create = function (screen) {
  let component = Blessed.box({
    name: 'battle',
    tags: true,
    top: 0,
    left: 0,
    height: screen.height - 2,
    width: 30,
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
  component.height = screen.height - 3
}

function prerender (component, screen) {
  let out = ''
  const { player, affects, battle } = State.state

  if (!battle || !battle.active) {
    return out
  }

  for (let participant of battle.participants.filter(p => p.side == 'good')) {
    out += renderParticipant(participant) + '\n'
  }

  out += `             -vs -\n\n`

  for (let participant of battle.participants.filter(p => p.side == 'evil')) {
    out += renderParticipant(participant) + '\n'
  }

  out += '\n'.repeat(screen.height - affects.length - battle.participants.length * 4 - 10)

  for (let affect of affects) {
    let gradient = ['{{k{{7', '{{k{{7', '{{k{{7', '{{k{{7', '{{k{{7']
    if (affect.negative) {
      gradient = ['{{W{{1', '{{W{{1', '{{W{{1', '{{W{{1', '{{W{{1']
    }
    out += U.renderBar(
      affect.name,
      Math.min(120, affect.timeLeft),
      120,
      30,
      gradient
    ) + '{{0\n'
  }

  out += '\n'

  out += U.renderBar(
    `${player.hp} HP`,
    player.hp,
    player.maxHp,
    30,
    ['{{W{{2', '{{W{{2', '{{W{{2', '{{W{{2', '{{W{{2']
  ) + '{{0\n'

  out += U.renderBar(
    `${player.energy} EN`,
    player.energy,
    player.maxEnergy,
    30,
    ['{{W{{4', '{{W{{4', '{{W{{4', '{{W{{4', '{{W{{4']
  ) + '{{0\n'

  out += U.renderBar(
    `${player.stamina} ST`,
    player.stamina,
    player.maxStamina,
    30,
    ['{{W{{3', '{{W{{3', '{{W{{3', '{{W{{3', '{{W{{3']
  ) + '{{0\n'

  out += U.renderBar(
    `${player.xpForNextLevel - player.xp} XP TNL`,
    player.xp - player.xpForCurrentLevel,
    player.xpForNextLevel - player.xpForCurrentLevel,
    30,
    ['{{W{{5', '{{W{{5', '{{W{{5', '{{W{{5', '{{W{{5']
  ) + '{{0\n'

  let comboBar = U.renderBar(
    `${player.combo} Combo`,
    player.combo,
    100,
    15,
    ['{{W{{3', '{{W{{3', '{{W{{3', '{{W{{3', '{{W{{3']
  )

  let rageBar = U.renderBar(
    `${player.rage} Rage`,
    player.rage,
    100,
    15,
    ['{{W{{1', '{{W{{1', '{{W{{1', '{{W{{1', '{{W{{1']
  )

  out += `${rageBar}{{0 ${comboBar}{{0\n`

  component.setContent(U.parseAnsi(out))
}

function renderParticipant ({ eid, name, hp, en, st, tag, status, target, nextAction }) {
  target = target || 'none'

  let entity = State.entityCache[eid]
  let level = ''
  if (!entity) {
    Conn.fetchEntity(eid)
  } else {
    level = `L${entity.level} `
  }

  let hpBar = U.renderBar(
    level + U.stripColorCodes(name),
    hp,
    100,
    30,
    ['{{W{{1', '{{W{{3', '{{W{{3', '{{W{{2', '{{W{{2']
  ) + '{{0'

  let enBar = U.renderBar(
    `EN`,
    en,
    100,
    10,
    ['{{W{{5', '{{W{{4', '{{W{{4', '{{W{{6', '{{W{{6']
  ) + '{{0'

  let stBar = U.renderBar(
    `ST`,
    st,
    100,
    10,
    ['{{W{{1', '{{W{{6', '{{W{{6', '{{W{{3', '{{W{{3']
  ) + '{{0'

  let actionBar = ''
  if (status) {
    actionBar = `  ${status}`
  } else {
    actionBar = U.renderBar(
      'Action',
      nextAction,
      20,
      10,
      ['{{W{{5', '{{W{{5', '{{W{{5', '{{W{{5', '{{W{{5']
    )
  }

  return `${hpBar}{{0\n${enBar}${stBar}${actionBar}{{0\n{{wTag: ${tag}       {{wTarget: ${target}{{0\n`
}