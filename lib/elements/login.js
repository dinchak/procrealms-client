const Blessed = require('blessed')

const Conn = require('../conn')
const State = require('../state')
const U = require('../utils')

let name
let password
let label

let character = {
  name: '',
  password: ''
}

exports.create = function (screen) {
  let component = Blessed.box({
    name: 'login',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    tags: true,
    style: {
      fg: 'lightwhite',
      bg: 'black'
    }
  })

  label = Blessed.box({
    name: 'label',
    top: 5,
    tags: true,
    left: '50%-29',
    width: 58,
    border: {
      type: 'line'
    },
    height: 7,
    style: {
      fg: 'lightwhite',
      bg: 'lightblue'
    }
  })

  name = Blessed.textbox({
    name: 'name',
    top: 9,
    left: '50%-13',
    keys: false,
    width: 26,
    height: 1,
    style: {
      fg: 'lightyellow',
      bg: 'gray'
    }
  })

  password = Blessed.textbox({
    name: 'password',
    top: 9,
    left: '50%-13',
    keys: false,
    censor: true,
    width: 26,
    height: 1,
    style: {
      fg: 'lightyellow',
      bg: 'gray'
    }
  })

  component.append(label)
  component.append(name)
  component.append(password)

  name.hide()
  password.hide()

  component.on('prerender', () => prerender(component, screen))
  component.on('keypress', (ch, key) => onKey(component, screen, ch, key))

  component.hide()

  return component
}

function prerender (component, screen) {
  if (State.picture) {
    component.setContent(`{center}${U.parseAnsi(State.picture)}{/center}`)
  }

  if (State.loginStep == 'name' && !name.focused) {
    label.setContent(U.parseAnsi('\n{center}{{WWelcome to {{YProcedural Realms{{W! What is your name?{/center}',))
    name.show()
    name.focus()
    name.readInput()
  }

  if (State.loginStep == 'password' && !password.focused) {
    label.setContent(U.parseAnsi('\n{center}{{WEnter your password{/center}',))
    password.clearValue()
    password.show()
    password.focus()
    password.readInput()
  }

  if (State.loginStep == 'choosePassword' && !password.focused) {
    label.setContent(U.parseAnsi('\n{center}{{WPlease choose a password{/center}',))
    password.clearValue()
    password.show()
    password.focus()
    password.readInput()
  }

  if (State.loginStep == 'waiting') {
    label.setContent(U.parseAnsi('\n{center}{{WPlease wait...{/center}',))
  }
}

function onKey (component, screen, ch, key) {
  if (key.name == 'escape') { // && State.loginStep == 'name') {
    return process.exit()
  }

  if (key.name == 'return' && State.loginStep == 'name') {
    character.name = name.getValue()
    if (character.name.length < 3) {
      process.nextTick(() => name.readInput())
      return
    }
    name.hide()
    State.loginStep = 'waiting'
    Conn.send('nameExists', character)
    return
  }

  if (key.name == 'return' && State.loginStep == 'password') {
    password.hide()
    State.loginStep = 'waiting'
    character.password = password.getValue()
    Conn.send('login', character)
    return
  }

  if (key.name == 'return' && State.loginStep == 'choosePassword') {
    password.hide()
    State.loginStep = 'waiting'
    character.password = password.getValue()
    Conn.send('create', character)
    return
  }

}