const Blessed = require('@dinchak/blessed')
const State = require('../state')
const U = require('../utils')

exports.create = function (screen) {
  let component = Blessed.box({
    name: 'room',
    tags: true,
    top: 0,
    left: 0,
    height: screen.height,
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
  component.height = screen.height
}

function prerender (component, screen) {
  let lines = []
  const { player, room, map, affects } = State.state

  if (!room) {
    return lines
  }

  lines.push(`  {{WLevel {{C${U.padRight(player.level, 3)} {{M${U.padLeft(player.class, 17)}{{0`)

  lines.push(U.renderBar(
    `${player.xpForNextLevel - player.xp} XP TNL`,
    player.xp - player.xpForCurrentLevel,
    player.xpForNextLevel - player.xpForCurrentLevel,
    30,
    ['{{W{{5', '{{W{{5', '{{W{{5', '{{W{{5', '{{W{{5']
  ))

  if (player.abilityPoints > 0) {
    lines.push(U.centerText(`{{G${player.abilityPoints}{{w unspent ability point${player.abilityPoints > 1 ? 's' : ''}`, 30))
  } else {
    lines.push(' ')
  }

  lines.push(`  {{WStrength {{R${U.padRight(player.strength, 6)}  {{WMagic {{C${player.magic}{{0`)
  lines.push(`   {{WAgility {{Y${U.padRight(player.agility, 6)} {{WSpirit {{G${player.spirit}{{0`)

  lines.push(' ')

  lines.push(`  {{WBludgeon {{y${U.padRight(player.resistBludgeoning, 7)} {{WSlash {{R${U.padRight(player.resistSlashing, 5)}`)
  lines.push(`    {{WPierce {{r${U.padRight(player.resistPiercing, 7)}  {{WHoly {{W${U.padRight(player.resistHoly, 5)}`)
  lines.push(`    {{WArcane {{C${U.padRight(player.resistArcane, 7)}   {{WIce {{B${U.padRight(player.resistIce, 5)}`)
  lines.push(`  {{WElectric {{Y${U.padRight(player.resistElectric, 7)}  {{WFire {{R${U.padRight(player.resistFire, 5)}`)
  lines.push(`    {{WPoison {{g${U.padRight(player.resistPoison, 7)}  {{WAcid {{G${U.padRight(player.resistAcid, 5)}`)

  lines.push(' ')

  let damage = U.padRight(`${player.damLow}-${player.damHigh}`, 13)
  lines.push(`   {{WDam {{R${damage} {{WDPR {{R${Math.round(player.dpr)}{{0`)

  let critical = U.padRight(`${U.renderNumber(player.criticalChance)}% ${U.renderNumber(player.criticalMultiplier)}x`, 11)
  lines.push(`  {{WCrit {{Y${critical} {{WSpeed {{Y${player.speed}{{0`)

  let focus = U.padRight(`${player.focus} ${Math.round(player.focusChance)}%`, 10)
  lines.push(` {{WFocus {{B${focus} {{WMagDam {{M${player.magicDamage}{{0`)

  lines.push(` {{WArmor {{G${U.padRight(player.armor, 10)} {{WAbsorb {{G${player.armorAbsorbtion}%{{0`)
  lines.push(` {{WRegen {{G${U.padRight(player.regeneration, 7)} {{WExp Bonus {{C${Math.round(player.xpGainBonus * 100)}%{{0`)
  lines.push(' ')
  lines.push(` {{WItems {{C${U.padRight(`${player.numItems}/${player.maxNumItems}`, 10)} {{WWeight {{C${Math.round(player.weight / player.maxWeight * 100)}%{{0`)
  lines.push(U.centerText(U.renderMoney(player.money).trim(), 30) + '{{0')

  let bufferLines = screen.height - 32 - affects.length
  for (let i = 0; i < bufferLines; i++) {
    lines.push(' ')
  }

  let maxAffectsToRender = affects.length + bufferLines
  let affectsRendered = 0
  for (let affect of affects) {
    affectsRendered++
    if (affectsRendered > maxAffectsToRender) {
      break
    }

    let gradient = ['{{k{{7', '{{k{{7', '{{k{{7', '{{k{{7', '{{k{{7']
    if (affect.negative) {
      gradient = ['{{W{{1', '{{W{{1', '{{W{{1', '{{W{{1', '{{W{{1']
    }
    lines.push(U.renderBar(
      affect.name,
      Math.min(120, affect.timeLeft),
      120,
      30,
      gradient
    ) + '{{0')
  }

  lines.push(' ')

  lines.push(U.renderBar(
    `${player.hp} HP`,
    player.hp,
    player.maxHp,
    30,
    ['{{W{{2', '{{W{{2', '{{W{{2', '{{W{{2', '{{W{{2']
  ) + '{{0')

  lines.push(U.renderBar(
    `${player.energy} EN`,
    player.energy,
    player.maxEnergy,
    30,
    ['{{W{{4', '{{W{{4', '{{W{{4', '{{W{{4', '{{W{{4']
  ) + '{{0')

  lines.push(U.renderBar(
    `${player.stamina} ST`,
    player.stamina,
    player.maxStamina,
    30,
    ['{{W{{3', '{{W{{3', '{{W{{3', '{{W{{3', '{{W{{3']
  ) + '{{0')

  lines.push(U.renderBar(
    `${player.food} Food`,
    player.food,
    player.maxFood,
    30,
    ['{{W{{6', '{{W{{6', '{{W{{6', '{{W{{6', '{{W{{6']
  ) + '{{0')

  lines.push(' ')

  if (map) {
    for (let line of map) {
      lines.push(`           {{0${line}`)
    }
  }

  lines.push(' ')

  lines.push(`{{)L{{W${room.level} {{M${room.x}{{w, {{M${room.y}`)
  lines.push(`${room.name}{{w`)

  if (room.canEnter) {
    lines.push(`{{wYou can {{<enter{{>`)
  } else {
    lines.push(' ')
  }

  component.setContent(U.parseAnsi(lines.join('\n')))
}
