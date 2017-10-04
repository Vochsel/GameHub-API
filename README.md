# GameHub-API
*Core API for Game Hub*

This repository contains the core API for the GameHub. The classes here represent the logic and structure required to run and handle game logic. 

To run these games, see the **GameHub-Server** repo.

For any questions, please don't hesitate to email me!

## API docs

See [`/doc/gh-api.md`](./doc/gh-api.md) for full documentation on the GameHub API

## Game Components

The **GameMode**, **Stage**, and **State** objects are at the core of the GameHub API. A solid understanding of their importance and use cases is required before making any game. They have been designed to be uniquely flexible in creating as many game types as possible. 

For a full example of these concepts in context see [`/examples/example_gm/`](./examples/example_gm/).

#### GameMode

The **GameMode** object defines the structure and properties of each GameMode. The GameMode will define the flow of each stage, and specify any required details.

```js
const GameHub = require('gh-api');

var gm = new GameHub.GameMode({
    name: "Demo Game",
    version: "0.1.3",
    stages: [
        demoStage
    ]
});
```

#### Stage

The **Stage** object is a way to group certain states into replayable, seperable, game stages. 

```js
const GameHub = require('gh-api');

var demoStage = new GameHub.Stage({
    name: "Demo Stage", 
    states: [
        demoState
    ]
});
```

#### State

The **State** object is at the core of every screen seen by players and handles the required MVC callbacks to handle game logic.

```js
const GameHub = require('gh-api');

var demoState = new GameHub.State({
    name: "Demo State"
});
```

## Usage Examples



