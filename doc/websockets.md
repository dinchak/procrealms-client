# Procedural Realms Websockets Protocol
This document outlines how to connect and interact with Procedural Realms using the websockets protocol.

## Message Format
Messages sent and received to/from the server are of the format:

```javascript
{
  cmd: 'some.command',
  msg: {
    some: 'data'
  }
}
```

* `cmd` is a string identifier for the message being sent or received 
* `msg` is a payload of any type: string, object, or it may not be present for all message types

## Authentication
Connect to: `ws://proceduralrealms.com:8000`
After connecting, authenticate the connection using the `login` or `token` cmds, or use `nameExists` and `create` to register a new character.

### nameExists
Allows a client to check if a player name is available for registration.
* Send to check if a name is taken: `{ cmd: 'nameExists', msg: { name } }`
* Response if the name is available: `{ cmd: 'login.nameAvailable', msg: { name } }`
* Response if the name is taken: `{ cmd: 'login.nameExists', msg: { name } }`
* Response if the name fails validation: `{ cmd: 'login.validationFailed' }`
* `name` is a string between 2 and 15 characters in length

### create
Creates a new player character and authenticates the connection.
* Send to create a new player character: `{ cmd: 'create', msg: { name, password, width, height, tutorial } }`
* Response if registration is successful: `{ cmd: 'token.success', msg: { name, token } }`
* Response if the name is unavailable: `{ cmd: 'login.fail' }`
* Response if a parameter fails validation: `{ cmd: 'login.validationFailed' }`
* `name` is a string between 2 and 15 characters in length
* `password` is a string up to 1024 characters
* `width` is the number of columns on the player's interface (between 10 and 300)
* `height` is the number of rows on the player's interface (between 10 and 300)
* `tutorial` is the string `Y` if the user wants to start the tutorial

### login
Allows authentication with a name and password.
* To authenticate with name and password: `{ cmd: 'login', msg: { name, password, width, height } }`
* Response if login is successful: `{ cmd: 'token.success', msg: { name, token } }`
* Response if the player doesn't exist or password is incorrect: `{ cmd: 'login.fail' }`
* Response if a parameter fails validation: `{ cmd: 'login.validationFailed' }`
* `name` is a string between 2 and 15 characters in length
* `password` is a string up to 1024 characters
* `width` is the number of columns on the player's interface (between 10 and 300)
* `height` is the number of rows on the player's interface (between 10 and 300)
* `tutorial` is the string `Y` if the user wants to start the tutorial

### token
Allows authentication with a name and token.
* To authenticate with name and token: `{ cmd: 'token', msg: { name, token, width, height } }`
* Response if login is successful: `{ cmd: 'token.success', msg: { name, token } }`
* Response if the player doesn't exist or token is incorrect: `{ cmd: 'token.fail' }`
* Response if a parameter fails validation: `{ cmd: 'login.validationFailed' }`
* `name` is a string between 2 and 15 characters in length
* `token` is an authentication token created from a previous `login`
* `width` is the number of columns on the player's interface (between 10 and 300)
* `height` is the number of rows on the player's interface (between 10 and 300)


## Sending Commands
Once authenticated, you interact with the game by sending `cmd` commands.
* Example: `{ cmd: 'cmd', msg: 'say Hello!' }`

### Updating Terminal Size
If the output terminal size changes, you can send a `terminal` message to let the server know.
* Example: `{ cmd: 'terminal', msg: { width: 80, height: 24 } }`

## Receiving Messages
Most messages you will receive will be either `out` or `state.update`.

### out
Text output from the game, probably written to a text output window.
* Example: `{ cmd: 'out', msg: '...' }`

### state.update
These messages contain instructions to update a state object representing the player's state, the room they are in, affects, skills, quests, etc.
* Example:
```javascript
{
  cmd: 'state.update',
  msg: {
    update: {
      player: {
        stamina: 118
      }
    },
    remove: {
      affects: true
    }
  }
}
```

## Fetching
Items and entities will be represented in the state object as id numbers. The details about the actual item and entity will need to be fetched from the server.

### Fetching an Item
* To fetch item with id 123: `{ cmd: 'item', msg: { iid: 123 } }`
* Example response:
```javascript
{
  cmd: 'item-123',
  msg: {
    iid: 123,
    name: 'wild greens',
    colorName: '\u001b[36mwild greens\u001b[37m',
    type: 'resource',
    subtype: 'plant',
    weight: 0,
    value: 0,
    level: 1,
    skillsRequired: [{
      name: 'basic crafting',
      level: 1
    }]
  }
}
```

### Fetching an Entity
* To fetch entity with id 123: `{ cmd: 'entity', msg: { eid: 123 } }`
* Example response:
```javascript
{
  cmd: 'entity-123',
  msg: {
    eid: 123,
    name: 'beetle',
    colorName: '\u001b[91mbeetle\u001b[37m',
    traits: ['monster', 'npc', 'evil'],
    level: 1,
    colorBattleTag: '\u001b[33m@\u001b[93m?',
    hp: 100,
    en: 100,
    st: 100,
    target: 0
  }
}
```