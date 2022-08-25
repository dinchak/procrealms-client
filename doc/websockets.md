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

## State Reference
Here is an example of a full state object for reference:

```javascript
{
  "player": {
    "eid": 26,
    "name": "Bignew",
    "level": 1,
    "class": "Freelancer",
    "xp": 285,
    "xpForNextLevel": 1000,
    "xpForCurrentLevel": 0,
    "xpGainBonus": 0.05,
    "cooldownTime": 0,
    "hp": 54,
    "maxHp": 54,
    "energy": 26,
    "maxEnergy": 26,
    "stamina": 104,
    "maxStamina": 104,
    "regeneration": 2,
    "combo": 0,
    "maxCombo": 100,
    "rage": 0,
    "maxRage": 100,
    "food": 9,
    "maxFood": 23,
    "money": 100,
    "weight": 9.1,
    "maxWeight": 120,
    "numItems": 3,
    "maxNumItems": 50,
    "abilityPoints": 0,
    "skillPoints": 0,
    "craftingPoints": 0,
    "strength": 0,
    "_strength": 0,
    "strengthHpBonus": 0,
    "strengthDamageBonus": 0,
    "strengthWeightBonus": 0,
    "agility": 0,
    "_agility": 0,
    "agilityCriticalBonus": 0,
    "agilitySpeedBonus": 0,
    "magic": 3,
    "_magic": 3,
    "magicEnergyBonus": 9,
    "magicDamageBonus": 2,
    "magicCastingTimeBonus": 0.03,
    "spirit": 0,
    "_spirit": 0,
    "spiritEnergyBonus": 0,
    "spiritFocusBonus": 0,
    "armor": 6,
    "armorAbsorbtion": 3,
    "speed": 0,
    "battleSpeed": "11.00",
    "damLow": 4,
    "damHigh": 8,
    "dpr": 6,
    "criticalChance": 1,
    "criticalMultiplier": 1.5,
    "focus": 3,
    "focusChance": 32.745398827639015,
    "magicDamage": 2,
    "castingTime": 0.03,
    "resistArcane": 0,
    "resistFire": 0,
    "resistIce": 1,
    "resistElectric": 0,
    "resistSlashing": 1,
    "resistPiercing": 1,
    "resistBludgeoning": 0,
    "resistPoison": 0,
    "resistAcid": 0,
    "resistHoly": 0
  },
  "battle": {
    "active": true,
    "myTurn": true,
    "actions": {
      "actions": [
        "attack",
        "defend",
        "flee",
        "cast"
      ],
      "skills": [],
      "spells": [
        "spark"
      ]
    },
    "participants": [
      {
        "eid": 13059,
        "name": "angry rat",
        "side": "evil",
        "tag": "\u001b[33m@\u001b[93mA",
        "hp": 88,
        "en": 100,
        "st": 88,
        "target": "\u001b[91mYou",
        "nextAction": 12.585786437626904,
        "status": ""
      },
      {
        "eid": 44875,
        "name": "Bignew",
        "side": "good",
        "tag": "\u001b[33m@\u001b[93mB",
        "hp": 81,
        "en": 104,
        "st": 83,
        "target": "\u001b[33m@\u001b[93mA\u001b[37m",
        "nextAction": 0,
        "status": "\u001b[97mReady"
      }
    ]
  },
  "channels": [
    {
      "name": "say",
      "color": "\u001b[96m",
      "enabled": true
    },
    {
      "name": "yell",
      "color": "\u001b[91m",
      "enabled": true
    },
    {
      "name": "party",
      "color": "\u001b[94m",
      "enabled": true
    },
    {
      "name": "tell",
      "color": "\u001b[92m",
      "enabled": true
    },
    {
      "name": "trade",
      "color": "\u001b[93m",
      "enabled": true
    },
    {
      "name": "gossip",
      "color": "\u001b[97m",
      "enabled": true
    },
    {
      "name": "newbie",
      "color": "\u001b[95m",
      "enabled": true
    },
    {
      "name": "announce",
      "color": "\u001b[97m",
      "enabled": true
    },
    {
      "name": "info",
      "color": "\u001b[96m",
      "enabled": true
    },
    {
      "name": "grapevine",
      "color": "\u001b[95m",
      "enabled": true
    }
  ],
  "skills": [
    {
      "name": "hand to hand",
      "type": [
        "weapon",
        "innate",
        "passive"
      ],
      "level": 1,
      "tnl": 0
    },
    {
      "name": "daggers",
      "type": [
        "weapon",
        "innate",
        "passive"
      ],
      "level": 2,
      "tnl": 34
    },
    {
      "name": "swords",
      "type": [
        "weapon",
        "innate",
        "passive"
      ],
      "level": 1,
      "tnl": 0
    },
    {
      "name": "maces",
      "type": [
        "weapon",
        "innate",
        "passive"
      ],
      "level": 1,
      "tnl": 0
    },
    {
      "name": "polearms",
      "type": [
        "weapon",
        "innate",
        "passive"
      ],
      "level": 1,
      "tnl": 0
    },
    {
      "name": "wands",
      "type": [
        "weapon",
        "innate",
        "passive"
      ],
      "level": 1,
      "tnl": 0
    },
    {
      "name": "axes",
      "type": [
        "weapon",
        "innate",
        "passive"
      ],
      "level": 1,
      "tnl": 0
    },
    {
      "name": "basic crafting",
      "type": [
        "crafting",
        "innate",
        "passive"
      ],
      "level": 1,
      "tnl": 0
    },
    {
      "name": "fishing",
      "type": [
        "crafting",
        "innate",
        "passive"
      ],
      "level": 1,
      "tnl": 0
    },
    {
      "name": "construction",
      "type": [
        "crafting",
        "passive"
      ],
      "level": 1,
      "tnl": 80
    },
    {
      "name": "spark",
      "type": [
        "learned",
        "combat"
      ],
      "rank": 1,
      "energyCost": 12,
      "spell": true
    }
  ],
  "affects": [
    {
      "name": "resist ice",
      "timeLeft": 161.75,
      "bonuses": [
        {
          "name": "resistIce",
          "value": 1
        }
      ]
    },
    {
      "name": "armor",
      "timeLeft": 161.75,
      "bonuses": [
        {
          "name": "armor",
          "value": 3
        }
      ]
    }
  ],
  "equipment": {
    "legs": 190362,
    "weapon": 190363
  },
  "inventory": [
    190359,
    190360,
    190361
  ],
  "aliases": [
    {
      "alias": "1",
      "command": "cast \"spark\""
    },
    {
      "alias": "2",
      "command": "sell all"
    }
  ],
  "quests": [
    {
      "name": "Seek the Shrine",
      "type": "story",
      "desc": "The Order welcomes you, @NAME! To where exactly, you might ask? And that would be a very good question, because we're not even sure exactly what this place is. Sure, we've figured out a few things, but the true nature of this reality still eludes even our most accomplished members.\n\nWe are The Order of the Ascii Tree, an ancient order dedicated to helping the sacred travelers, such as yourself, navigate their way through this dimension and back to the mysterious place known as \"Real Life\". Our founders were travelers as well, but they have long since passed from this realm. None of the present day Order have experienced Real Life and thus we dedicate our lives to helping the sacred travelers find their way back, such that we might one day find the way ourselves.\n\nThere is much more to teach, but you are not yet ready. Seek out the Shrine Keepers, the ancient knowledge they possess will help you on your journey.",
      "activity": "delivery",
      "level": 1,
      "giver": "Blasti the priest",
      "npc": "shrine keeper",
      "location": {
        "areaName": "The Great Plains",
        "x": 252,
        "y": 249
      }
    },
    {
      "name": "Lettuce of Legends",
      "type": "story",
      "desc": "@NAME! The Order speaks of a legendary sandwich, easy to prepare yet powerful beyond comprehension. Nobody has tasted such a sandwich in centuries, however, I believe I may have stumbled upon some clues that may lead us to understand this powerful concoction of bread and fillings.\n\nMy sources tell me that \u001b[32mlettuce\u001b[37m is a primary ingredient. @NAME, if you stumble upon any \u001b[36mwild greens\u001b[37m in your travels, would you please \u001b[1;97mharvest\u001b[0;37m them and bring me their \u001b[32mlettuce\u001b[37m so that I might begin to better understand this magnificent preparation.\n\nBy the way, you might want to make use of the \u001b[1;97mmonitor\u001b[0;37m and \u001b[1;97mprospect\u001b[0;37m commands in your search for \u001b[36mwild greens\u001b[37m.",
      "activity": "collect_item",
      "level": 1,
      "giver": "Blasti the priest",
      "items": [
        {
          "name": "lettuce",
          "amount": 1
        }
      ]
    },
    {
      "name": "\u001b[37mKill \u001b[97m2\u001b[37mx \u001b[91mbeetle\u001b[37m",
      "type": "generated",
      "desc": "",
      "activity": "kill_monster",
      "level": 1,
      "giver": "Varne the captain",
      "amount": 2,
      "progress": 0,
      "monster": "beetle"
    },
    {
      "name": "\u001b[37mKill \u001b[97m2\u001b[37mx \u001b[91mrat\u001b[37m",
      "type": "generated",
      "desc": "",
      "activity": "kill_monster",
      "level": 1,
      "giver": "Varne the captain",
      "amount": 2,
      "progress": 0,
      "monster": "rat"
    }
  ],
  "room": {
    "id": 174,
    "level": 1,
    "x": 6,
    "y": 14,
    "area": "The Nexus",
    "areaId": "nexus",
    "generated": true,
    "name": "\u001b[97mAltar\u001b[37m",
    "weather": "",
    "exits": [
      "west",
      "north",
      "northwest",
      "northeast",
      "east",
      "southwest",
      "south",
      "southeast"
    ],
    "doors": {},
    "entities": [
      89,
      44875
    ],
    "items": [
      1801
    ],
    "canEnter": false
  },
  "map": [
    "\u001b[33mG\u001b[37m..\u001b[97m>\u001b[37m..\u001b[91mS",
    "\u001b[95m!\u001b[37m.....\u001b[93mE",
    "\u001b[97m~\u001b[37m.....\u001b[95m0",
    "\u001b[92mR\u001b[37m.\u001b[92m*\u001b[97m&\u001b[92m*\u001b[37m.\u001b[92mY",
    "\u001b[90m##\u001b[37m.\u001b[95m1\u001b[37m.\u001b[90m##",
    "\u001b[37m \u001b[90m#\u001b[37m.\u001b[95m2\u001b[37m.\u001b[90m#\u001b[37m ",
    "\u001b[37m \u001b[90m#####\u001b[37m"
  ],
  "slots": [
    {
      "slot": "1",
      "label": "spark"
    },
    {
      "slot": "2",
      "label": "sell all"
    }
  ]
```