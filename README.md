# GameHub-API
*Core API for Game Hub*

This repository contains the core API for the GameHub. The classes here represent the logic and structure required to run and handle game logic. 

To run these games, see the [GameHub-Server](https://github.com/Vochsel/GameHub-Server) repo.

For any questions, please don't hesitate to email me!

## API docs

See [`/doc/gh-api.md`](./doc/gh-api.md) for full documentation on the GameHub API

## Game Components

The **GameMode**, **Stage**, and **State** objects are at the core of the GameHub API. A solid understanding of their importance and use cases is required before making any game. They have been designed to be uniquely flexible in creating as many game types as possible. 

For a full example of these concepts in context see [`/examples/example_gm/`](./examples/example_gm/).

#### GameMode

The **GameMode** object defines the structure and properties of each GameMode. The GameMode will define the flow of each stage, and specify any required details.

##### GameMode Events
* Load
* Enter
* Exit


```js
const GameHub = require('gh-api');

var gm = new GameHub.GameMode({
    name: "Demo Game",
    version: "0.1.3",
    model: {
        someData: 42
    },
    resources: [
        {
            src: "resources/default.json"
        }
    ],
    flow: [
        {
            stage: "demoStage",
            repeats: 4
        }
    ]
    stages: [
        demoStage
    ]
});
```

#### Stage

The **Stage** object is a way to group certain states into replayable, seperable, game stages. 

##### Stage Events
* Load
* Enter
* Exit

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

##### State Events
* Load
* Enter
* Exit

```js
const GameHub = require('gh-api');

var demoState = new GameHub.State({
    name: "Demo State",
    model: {},
    views: [
        {
            data: "This will be shown on default clients"
        }
    ],
    controllers: [
        {
            submitData: function() {
                return 1;
            }
        }
    ]
});
```

## Core Components

### Device
Each connected client should have an associated **Device** object. The device is the main connection to remote clients and are varied by their role and type.

Each device is classified by a type, and can be sub-classified by role. Roles can be changed during gameplay, types can not.

#### Device Events
* Load
* Refresh
* Reset

### Resource
The **Resource** object acts as a container for ordered data to be attached to specific Game Mode's.

Resources require a name which is used to identify and retrieve from the GameMode resource pool.

#### Resource Events
* Load

## MVC Components

### Controller
Each **State** can hold an array of **Controllers** which contain definitions of functions, accessible by **View** DOM inputs.

Controller functions are passed a reference to the calling device and the associated data specified from DOM. Most HTML Input fields are supported. Canvas' are sent aswell. 

For custom data, the **data-value** property can be set on the associate DOM.

Controller functions are specified by the **data-action** property.


#### Examples

```html
<h2>Your Name</h2>
<input type='text' data-id='clientName'/>
<div class='button' data-action='funcA()' data-id='btnData' data-value='demo data!'>Button!</div>
```

```js
var demoController = new Controller({
    funcA: function(device, data) {
        console.log("funcB has just been called from Device UID: " + device.uid + "!");
        console.log(data.btnData);      //This will print out 'demo data!'
        console.log(data.clientName);   //This will print out text input
    },
})
```

### View
Each **State** can hold an array of **Views** which are broadcast on **State** transition and update events. Views must be defined for all chosen **Device** *Types* and *Roles*.

#### Examples

```js
var demoView = new View({
    type: "hub",
    role: "default",    //This can be excluded if default
    data: "The raw data to be broadcast to matching devices"
})
```