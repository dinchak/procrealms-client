browserify ../index.js --ignore-missing -t [ envify --NODE_ENV=production ] | uglifyjs --compress drop_debugger=false --mangle eval=false -b beautify=false,ascii_only=true > ../www/js/bundle.js
