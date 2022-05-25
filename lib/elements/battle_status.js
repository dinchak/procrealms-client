const { table } = require('table')

const Blessed = require('blessed')
const State = require('../state')
const U = require('../utils')

exports.create = function (screen) {
  let component = Blessed.box({
    name: 'battle',
    tags: true,
    top: getBoxTop(screen),
    left: 0,
    height: getBoxHeight(screen),
    style: {
      fg: 'white',
      bg: 'black'
    }
  })

  screen.on('resize', () => resize(component, screen))

  component.on('prerender', () => prerender(component, screen))

  return component
}

function getBoxTop (screen) {
  let { battle } = State.state
  if (!battle) {
    return screen.height - 10
  }

  return battle.participants.length + 2
}

function getBoxHeight (screen) {
  return getBoxTop(screen) - 3
}

function resize (component, screen) {
  component.top = getBoxTop(screen)
  component.height = getBoxHeight(screen)
  component.width = screen.width
}

function prerender (component, screen) {
  let lines = []
  const { battle } = State.state

  if (!battle || !battle.active) {
    return lines
  }

  let rows = [[
    'Combatant',
    'HP',
    'EN',
    'ST',
    'Target',
    'Status'
  ]]

  for (let { name, hp, en, st, status, target, nextAction } of battle.participants.filter(p => p.side == 'good')) {
    let row = [
      U.parseAnsi(name),
      U.parseAnsi(hp),
      U.parseAnsi(en),
      U.parseAnsi(st),
      U.parseAnsi(target || '{{KNone'),
      U.parseAnsi(status),
    ]
    rows.push(row)
  }

  rows.push([
    ' - vs - ',
    '',
    '',
    '',
    '',
    ''
  ])

  for (let { name, hp, en, st, status, target, nextAction } of battle.participants.filter(p => p.side == 'evil')) {
    let row = [
      U.parseAnsi(name),
      U.parseAnsi(hp),
      U.parseAnsi(en),
      U.parseAnsi(st),
      U.parseAnsi(target || '{{KNone'),
      U.parseAnsi(status),
    ]
    rows.push(row)
  }

  if (rows.length) {
    lines = lines.concat(
      table(rows, U.getBorderlessTableConfig()).split('\n')
    )
  }

  component.setContent(U.parseAnsi(lines.join('\n')))
}
