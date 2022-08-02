#!/usr/bin/env node
'use strict';
const Blessed = require('@dinchak/blessed');
const App = require('./app');

(async (global) => {

  const window = global.window;
  const opts = window && await new Promise((resolve) => {
    window.onload = () => {
      const TermJs = require('term.js');
      const Terminal = TermJs.Terminal;
      const term = new Terminal({
          cols: 1,
          rows: 1,
          useStyle: true,
          screenKeys: true,
          colors: [
            // dark:
            '#222222', // black
            '#aa2222', // red3
            '#22aa22', // green3
            '#aaaa22', // yellow3
            '#2222aa', // blue2
            '#aa22aa', // magenta3
            '#22aaaa', // cyan3
            '#cccccc', // gray90
            // bright:
            '#555555', // gray50
            '#e05555', // red
            '#55e055', // green
            '#e0e055', // yellow
            '#5555e0', // rgb:5c/5c/ff
            '#e055e0', // magenta
            '#55e0e0', // cyan
            '#ffffff'  // white
          ],
          rendererType: 'canvas', // Don't use canvas in xterm.
      });

      term.open(document.getElementById('terminal'));

      // glue to make Blessed work in browserify
      term.columns = term.cols;
      term.isTTY = true;

      const resizeTerminal = function () {
        let width = window.innerWidth;
        let height = window.innerHeight;
        let cols = Math.floor(width / 10) - 1;
        let rows = Math.floor(height / 20) - 1;
        // console.log(`width=${width}, height=${height}, cols=${cols}, rows=${rows}`);
        term.resize(cols, rows);
      };

      resizeTerminal();

      window.onresize = function () {
        resizeTerminal();
      };

      resolve({ input: term, output: term, tput: false });
    };
  });

  const program = new Blessed.program(opts);

  App.init(program);
})(global || window);
