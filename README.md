# procrealms-client
A character-mode terminal/web hybrid client for [Procedural Realms](http://www.proceduralrealms.com).

```
npm install -g procrealms-client
procrealms
```

See it in action at [http://play.proceduralrealms.com](http://play.proceduralrealms.com)

A few screenshots in the browser:

![Login Page](doc/ss1.png)
![Explore](doc/ss3.png)
![Battle](doc/ss2.png)

# Modifying/Running

To clone this repository and run the code:

```
git clone https://github.com/dinchak/procrealms-client
cd procrealms-client
npm install
node index.js
```

# Browser Builds

Use `browserify` to build for the browser:

```
npm install -g browserify
browserify index.js --ignore-missing -o www/js/bundle.js
```

Or see the build scripts in `utils` for more examples with minification, etc.

