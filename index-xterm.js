// browserify this-file.js --ignore-missing -o bundle.js
'use strict';
const Blessed = require('@dinchak/blessed');
const App = require('./app');

(async (global) => {

  const window = global.window;
  const opts = window && await new Promise((resolve) => {
    window.onload = () => {
      const stream = require('stream');
      const TermJs = require('xterm');
      const FitAddon = require('xterm-addon-fit').FitAddon
      const Terminal = TermJs.Terminal;
      const term = new Terminal({
          fontFamily: 'DOS',
          fontSize: 10,
          cols: 80,
          rows: 24,
          rendererType: 'canvas'
      });

      const fitAddon = new FitAddon();
      // term.loadAddon(fitAddon);

      term.open(document.getElementById('terminal'));

      window.onresize = function () {
        resizeTerminal();
      };

      let input = new stream.Readable({ read() {} })
      term.onKey(function (ev) {
        console.log(ev.key)
        input.emit('data', ev.key)
      })

      let output = Object.assign(term, {
        isTTY: true,
        columns: term.cols,
        writable: true,
        on: (event, cb) => {
          console.log(`on(${event}) requested`)
          if (event == 'resize') {
            console.log(`bind resize listener`)
            term.onResize(cb)
          }
        },
        _write: (chunk, encoding, next) => {
          term.write(chunk)
          console.log(chunk.toString())
          next()
        }
      });

      const resizeTerminal = function () {
        let width = window.innerWidth;
        let height = window.innerHeight;
        let cols = Math.floor(width / 10) - 1;
        let rows = Math.floor(height / 5) - 1;
        console.log(`width=${width}, height=${height}, cols=${cols}, rows=${rows}`);
        term.resize(cols, rows);
        output.columns = cols
      };

      resizeTerminal();

      resolve({ input, output, term: 'xterm' });
    };
  });


  const program = new Blessed.program(opts);
  // program.clear();
  // program.move(1, 1);
  // program.write('\x1b[38;2;255;200;0mTRUECOLOR\x1b[0m\n');
  // program.write('\x1b[38;2;81;108;156;48;2;79;109;152mtest\n')
  // program.setx((program.cols / 2 | 0) - 4);
  // program.down(5);
  // program.write('Hi again!');
  // program.bg('!black');
  // program.feed();

  App.init(program);
})(global || window);
