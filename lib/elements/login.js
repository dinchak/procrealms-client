const Blessed = require('blessed')

const Conn = require('../conn')
const Graphic = require('./graphic')
const Log = require('../log')
const State = require('../state')
const U = require('../utils')
const UI = require('../ui')

let label
let name
let password
let tutorial

exports.loginForm = {
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

  tutorial = Blessed.textbox({
    name: 'tutorial',
    top: 9,
    left: '50%-1',
    keys: false,
    width: 1,
    height: 1,
    style: {
      fg: 'lightyellow',
      bg: 'gray'
    }
  })

  name.on('cancel', () => onNameCancel(screen))
  password.on('cancel', () => onPasswordCancel(screen))
  tutorial.on('cancel', () => onTutorialCancel(screen))

  component.append(label)
  component.append(name)
  component.append(password)
  component.append(tutorial)

  name.hide()
  password.hide()
  tutorial.hide()

  component.on('prerender', () => prerender(component, screen))
  component.on('keypress', (ch, key) => onKey(component, screen, ch, key))

  component.hide()

  return component
}

function prerender (component, screen) {
  component.setContent(`{center}${Graphic.render()}{/center}`)
  // if (State.picture) {
  //   // component.screen.program._write(U.parseAnsi(State.picture))
  //   // process.exit()
  //   component.setContent(`{center}${U.parseAnsi(State.picture)}{/center}`)
  // }
}

exports.setLoginStep = function (newStep) {
  Log.write(`Login.setLoginStep(${newStep})`)
  State.loginStep = newStep

  if (State.loginStep == 'name') {
    label.setContent(U.parseAnsi('\n{center}{{WGreetings, adventurer! By what name are you known?{/center}',))
    activateTextArea(name)
  }

  if (State.loginStep == 'tokenFailed') {
    label.setContent(U.parseAnsi('\n{center}{{WApologies, your token has expired By what name are you known?!{/center}',))
    activateTextArea(name)
  }

  if (State.loginStep == 'loginFailed') {
    label.setContent(U.parseAnsi('\n{center}{{WSorry, I do not recognize that name and password combination.  By what name are you known?{/center}',))
    activateTextArea(name)
  }

  if (State.loginStep == 'password') {
    label.setContent(U.parseAnsi('\n{center}{{WEnter your password{/center}',))
    activateTextArea(password, true)
  }

  if (State.loginStep == 'choosePassword') {
    label.setContent(U.parseAnsi(`\n{center}{{WAh, you must be new here, {{Y${exports.loginForm.name}{{W! Welcome!\nPlease choose a password.{/center}`,))
    activateTextArea(password, true)
  }

  if (State.loginStep == 'confirmPassword') {
    label.setContent(U.parseAnsi(`\n{center}{{WCould you repeat that password?{/center}`,))
    activateTextArea(password, true)
  }

  if (State.loginStep == 'tutorial') {
    label.setContent(U.parseAnsi(`\n{center}{{WWould you like to start the tutorial? [Y/n]{/center}`,))
    activateTextArea(tutorial)
  }

  if (State.loginStep == 'waiting') {
    label.setContent(U.parseAnsi('\n{center}{{WPlease wait...{/center}',))
  }
}

function onNameCancel () {
  if (U.inBrowser()) {
    name.focus()
    name.readInput()
  }
}

function onPasswordCancel (screen) {
  deactivateTextArea(password)
  if (State.loginStep == 'confirmPassword') {
    exports.setLoginStep('choosePassword')
    return
  }

  exports.setLoginStep('name')
}

function onTutorialCancel (screen) {
  Log.write('onTutorialCancel tutorial.hide()')
  deactivateTextArea(tutorial)
  exports.setLoginStep('confirmPassword')
}

function onKey (component, screen, ch, key) {
  Log.write(`ch=${ch}, key=${JSON.stringify(key)}`)

  if (key.name == 'escape' && ['name', 'loginFailed', 'tokenFailed'].includes(State.loginStep)) {
    Log.write(`got escape on name loginStep`)
    if (!U.inBrowser()) {
      return process.exit()
    }
  }

  if (key.name == 'return' && ['name', 'loginFailed', 'tokenFailed'].includes(State.loginStep)) {
    exports.loginForm.name = U.ucfirst(name.getValue())

    Log.write(`set loginForm name=${exports.loginForm.name}`)

    if (exports.loginForm.name.length < 3) {
      label.setContent(`\n{center}Name is too short{/center}`)
      process.nextTick(() => name.readInput())
      return
    }

    if (exports.loginForm.name.length > 15) {
      label.setContent(`\n{center}Name is too long{/center}`)
      process.nextTick(() => name.readInput())
      return
    }

    if (!exports.loginForm.name.match(/^[a-zA-Z]+$/)) {
      label.setContent(`\n{center}Invalid characters in name{/center}`)
      process.nextTick(() => name.readInput())
      return
    }

    deactivateTextArea(name)
    exports.setLoginStep('waiting')

    Conn.send('nameExists', exports.loginForm)
    return
  }

  if (key.name == 'return' && State.loginStep == 'password') {
    Log.write(`set loginForm password=...`)
    exports.loginForm.password = password.getValue()
    exports.loginForm.width = UI.getTerminalWidth()
    exports.loginForm.height = UI.getTerminalHeight()

    deactivateTextArea(password)
    exports.setLoginStep('waiting')

    Conn.send('login', exports.loginForm)
    return
  }

  if (key.name == 'return' && State.loginStep == 'choosePassword') {
    Log.write(`set loginForm password=...`)
    exports.loginForm.password = password.getValue()

    deactivateTextArea(password)
    exports.setLoginStep('confirmPassword')
    return
  }

  if (key.name == 'return' && State.loginStep == 'confirmPassword') {

    deactivateTextArea(password)
    if (exports.loginForm.password == password.getValue()) {
      exports.setLoginStep('tutorial')
    } else {
      exports.setLoginStep('choosePassword')
    }
    screen.render()
    return
  }

  if (key.name == 'return' && State.loginStep == 'tutorial') {
    let value = U.ucfirst(tutorial.getValue())
    if (!['Y', 'N'].includes(value)) {
      process.nextTick(() => tutorial.readInput())
      return
    }

    exports.loginForm.tutorial = value
    exports.loginForm.width = UI.getTerminalWidth()
    exports.loginForm.height = UI.getTerminalHeight()

    deactivateTextArea(tutorial)
    exports.setLoginStep('waiting')
    screen.render()

    Conn.send('create', exports.loginForm)
    return
  }
}

function activateTextArea (textArea, clearValue) {
  if (!textArea.visible) {
    Log.write(`${textArea.name}.show()`)
    textArea.show()
  }
  if (!textArea.focused) {
    Log.write(`${textArea.name}.focus()`)
    textArea.focus()
    if (clearValue) {
      Log.write(`${textArea.name}.clearValue()`)
      textArea.clearValue()
    }
  }
  if (!textArea._reading) {
    Log.write(`${textArea.name}.readInput()`)
    textArea.readInput()  
  }
}

function deactivateTextArea (textArea) {
  if (textArea.focused) {
    Log.write(`${textArea.name}.screen.focusPop()`)
    textArea.screen.focusPop()
  }
  if (textArea.visible) {
    Log.write(`${textArea.name}.hide()`)
    textArea.hide()
  }
}
