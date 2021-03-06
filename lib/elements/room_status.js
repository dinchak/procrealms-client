const Blessed = require('@dinchak/blessed')
const State = require('../state')
const U = require('../utils')

let mapMargin = 8

exports.create = function (screen) {
  let component = Blessed.box({
    name: 'room',
    tags: true,
    top: screen.height - 10,
    left: 0,
    height: 7,
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
  component.top = screen.height - 10
  component.width = screen.width
}

function prerender (component, screen) {
  let lines = []
  const { room, map } = State.state

  if (!room) {
    return lines
  }
  
  if (room.canEnter) {
    lines.push(`{{wYou can {{Wenter{{w.`)
  }
  lines = lines.concat(renderEntities(component))
  lines = lines.concat(renderItems(component))

  if (map) {
    let i = 0
    for (let line of map) {
      lines[i] = `{{0${line} ${(lines[i] || '')}`
      i++
    }
  }

  component.setContent(U.parseAnsi(lines.join('\n')))
}

function renderEntities (component) {
  const { player, room } = State.state
  if (!room) {
    return ''
  }

  let names = []

  for (let eid of room.entities) {
    if (eid == player.eid) {
      continue
    }

    let entity = State.entityCache[eid]
    if (!entity) {
      continue
    }
    names.push(`{{wL{{W${entity.level} ${entity.colorName}{{w`)
  }

  if (!names.length) {
    return ''
  }

  let out = `{{0` + U.listToString(names)
  if (names.length == 1) {
    out += ' is here.'
  } else {
    out += ' are here.'
  }

  return U.wordWrap(out, component.width - mapMargin).split('\n')
}

function renderItems (component) {
  const { room } = State.state
  if (!room) {
    return ''
  }

  let stacks = {}
  let names = []

  for (let iid of room.items) {
    let item = State.itemCache[iid]
    if (!item) {
      continue
    }
    let name = ''
    if (item.level) {
      name = `{{wL{{W${item.level} `
    }
    name += `{{C${item.name}{{w`
    if (stacks[name]) {
      stacks[name]++
    } else {
      stacks[name] = 1
    }
  }

  for (let name in stacks) {
    if (stacks[name] > 1) {
      names.push(stacks[name] + 'x ' + name)
    } else {
      names.push(name)
    }
  }

  if (!names.length) {
    return ''
  }

  let out = `{{0` + U.listToString(names)
  if (names.length == 1) {
    out += ' is on the ground.'
  } else {
    out += ' are on the ground.'
  }

  return U.wordWrap(out, component.width - mapMargin).split('\n')
}
