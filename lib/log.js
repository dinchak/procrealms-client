const fs = require('fs')
const path = require('path')

const U = require('./utils')

exports.write = function (str) {
  if (U.inBrowser() || process.env.NODE_ENV == 'production' || true) {
    return
  }
  fs.appendFileSync(path.join(__dirname, '..', 'logs', 'client.log'), str.trim() + '\n')
}