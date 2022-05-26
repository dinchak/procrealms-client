const fs = require('fs')
const path = require('path')

const U = require('./utils')

exports.write = function (str) {
  if (process.env.NODE_ENV == 'dev' || U.inBrowser()) {
    return
  }
  fs.appendFileSync(path.join(__dirname, '..', 'logs', 'client.log'), str.trim() + '\n')
}