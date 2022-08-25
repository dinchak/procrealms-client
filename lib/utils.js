const colorTable = {
  k: '\u001b[30m',
  K: '\u001b[90m',
  0: '\u001b[40m',
  ')': '\u001b[100m',

  r: '\u001b[31m',
  R: '\u001b[91m',
  1: '\u001b[41m',
  '!': '\u001b[101m',

  g: '\u001b[32m',
  G: '\u001b[92m',
  2: '\u001b[42m',
  '@': '\u001b[102m',

  y: '\u001b[33m',
  Y: '\u001b[93m',
  3: '\u001b[43m',
  '#': '\u001b[103m',

  b: '\u001b[34m',
  B: '\u001b[94m',
  4: '\u001b[44m',
  '$': '\u001b[104m',

  m: '\u001b[35m',
  M: '\u001b[95m',
  5: '\u001b[45m',
  '%': '\u001b[105m',

  c: '\u001b[36m',
  C: '\u001b[96m',
  6: '\u001b[46m',
  '^': '\u001b[106m',

  w: '\u001b[37m',
  W: '\u001b[97m',
  7: '\u001b[47m',
  '&': '\u001b[107m',

  '<': '\u001b[97m',
  '>': '\u001b[37m',
  '{': '{',
  'Z': '\u001b[0m'
}

exports.parseAnsi = function (str) {
  return exports.parseColor(str.replace(/\\u001b/g, '\u001b'))
}

exports.parseColor = function (str) {
  str = str || ''
  let pieces = str.split(/({{[a-zA-Z0-9)!@#$%^<>{])/g)
  let out = ''

  for (let i = 0; i < pieces.length; i++) {
    let color = false
    let colorKey = ''

    if (pieces[i].substr(0, 2) == '{{') {
      colorKey = pieces[i].substr(2, 1)
      color = colorTable[colorKey]
      if (color) {
        i++
      }
    }

    if (color) {
      out += color + pieces[i]
    } else {
      out += pieces[i]
    }
  }

  return out
}

exports.wordWrap = function (str, maxWidth) {
  let newStr = ''
  let visibleCharsThisLine = 0
  let totalCharsThisLine = 0
  let newLineStart = 0
  let lastColor

  if (!str) {
    return ''
  }

  let insideAnsiCode = false

  for (let i = 0; i < str.length; i++) {
    newStr += str[i]
    totalCharsThisLine++

    if (str[i] == "\u001b") {
      insideAnsiCode = true
      continue
    }

    if (insideAnsiCode) {
      if (str[i] == 'm') {
        insideAnsiCode = false
      }
      continue
    }

    if (str[i-2] == '{' && str[i-1] == '{') {
      if (!['<', '>'].includes(str[i])) {
        lastColor = '{{' + str[i]
      }
    }

    if (str[i] == '{' || str[i-1] == '{') {
      continue
    }


    if (str[i] == '\r' || str[i] == '\n') {
      visibleCharsThisLine = 0
      continue
    }

    visibleCharsThisLine++

    if (visibleCharsThisLine >= maxWidth) {
      let checkForSpace = newStr.substring(newLineStart, newLineStart + totalCharsThisLine)
      let overflow = ''
      let newline = ''
      if (checkForSpace.match(/\s/)) {
        newline = '\n'
        for (let j = newStr.length - 1; j > 0; j--) {
          overflow = `${newStr[j]}${overflow}`
          newStr = newStr.substring(0, newStr.length - 1)
          if (newStr[j-1].match(/\s/)) {
            newStr = newStr.substring(0, newStr.length - 1)
            break
          }
        }
      }
      newStr += newline
      newLineStart = newStr.length
      if (lastColor) {
        newStr += lastColor
        lastColor = null
      }
      newStr += overflow
      visibleCharsThisLine = exports.numVisibleChars(overflow)
      totalCharsThisLine = overflow.length
    }
  }

  return newStr
}

exports.numVisibleChars = function (str) {
  let insideAnsiCode = false
  let visibleChars = 0

  for (let i = 0; i < str.length; i++) {
    if (str[i] == "\u001b") {
      insideAnsiCode = true
      continue
    }

    if (insideAnsiCode) {
      if (str[i] == 'm') {
        insideAnsiCode = false
      }
      continue
    }

    if (str[i] == '{' || str[i-1] == '{') {
      continue
    }

    visibleChars++
  }

  return visibleChars
}

exports.listToString = function (list, seperator='and') {
  if (!list) {
    return ''
  }
  list = list.filter(it => it)
  if (!list.length) {
    return ''
  }
  if (list.length == 1) {
    return list.pop()
  }
  let final = list.pop()
  return `${list.join(', ')} ${seperator} ${final}`
}

exports.objectToString = function (obj) {
  return JSON.stringify(obj, function(key, value) {
    if (typeof value == "string") {
      return "{{C" + value + "{{w"
    }

    if (typeof value == "number") {
      return "{{G" + value + "{{w"
    }

    if (typeof value == "boolean") {
      return "{{R" + value + "{{w"
    }

    return value
  }, 2).replace(/\"/g, '') + '\n'
}

exports.renderBar = function (label, amt, max, size, colors, centered = true, brackets = false) {
  label = '' + label
  let bars = Math.ceil(amt / max * size)
  let labelStart = 0
  if (centered) {
    labelStart = size / 2 - label.length / 2
  }
  let bar = ''

  let color = colors[0]
  if (bars >= size * 0.80) {
    color = colors[4]
  } else if (bars >= size * 0.60) {
    color = colors[3]
  } else if (bars >= size * 0.40) {
    color = colors[2]
  } else if (bars >= size * 0.20) {
    color = colors[1]
  }

  for (let i = 0; i < size; i++) {
    let char
    let clr
    if (i < bars) {
      char = ` `
      clr = color
    } else {
      char = ' '
      clr = '{{0{{w'
    }
    if (i >= labelStart && i < labelStart + label.length) {
      char = `${clr}${label.substr(i - labelStart, 1)}`
    }
    if (brackets) {
      if (i == 0 && char == ' ') {
        char = '['
      } else if (i == size - 1 && char == ' ') {
        char = ']'
      }
    }
    bar += `${clr}${char}`
  }

  return bar + '{{0{{w'
}

exports.renderMoney = function (amount, brief = false) {
  let copper = amount % 100
  let silver = Math.floor(amount / 100) % 100
  let gold = Math.floor(amount / 10000)
  let str = ''

  if (gold) {
    if (brief) {
      str += `{{Y${gold}g`
    } else {
      str += `{{Y${gold} gold`
    }
  }

  if (silver) {
    str += ' '
    if (brief) {
      str += `{{W${silver}s`
    } else {
      str += `{{W${silver} silver`
    }
  }

  if (copper || amount == 0) {
    str += ' '
    if (brief) {
      str += `{{C${copper}c`
    } else {
      str += `{{C${copper} copper`
    }
  }

  return str + '{{w'
}

exports.timeLeft = (time) => {
  let out = ''

  let minutes = Math.floor(time / 60)
  let hours = Math.floor(minutes / 60)

  if (hours > 0) {
    out += `${hours}h `
  }

  if (minutes > 0) {
    out += `${minutes % 60}m `
  } else {
    out += `${time % 60}s`
  }

  return out.trim()
}

exports.ucfirst = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

exports.centerText = function (str, size) {
  let padAmount = Math.max(0, Math.floor((size - exports.stripColorCodes(str).length) / 2))
  return ' '.repeat(padAmount) + str
}

exports.padLeft = function (str, length) {
  return ' '.repeat(length - Math.min(length, exports.stripColorCodes('' + str).length)) + str
}

exports.padRight = function (str, length) {
  return str + ' '.repeat(length - Math.min(length, exports.stripColorCodes('' + str).length))
}

exports.stripColorCodes = function (str) {
  return str.replace(/\u001b[^\s]+m/g, '').replace(/{{./g, '')
}

exports.renderNumber = function (value, digits = 2) {
  if (value == Math.floor(value)) return Math.round(value) + ''
  return value.toFixed(digits)
}

exports.inBrowser = function () {
  return typeof window != 'undefined'
}

