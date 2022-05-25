#!/usr/bin/env -S NODE_ENV=production node
'use strict';
const Blessed = require('blessed');
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
