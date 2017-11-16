/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

"use strict";

var GameHub = require("./lib/GameHub");

GameHub.Resource = require("./lib/core/Resource");
GameHub.Device = require("./lib/core/Device");

GameHub.GameMode = require("./lib/game/GameMode");
GameHub.Stage = require("./lib/game/Stage");
GameHub.State = require("./lib/game/State");

GameHub.View = require("./lib/mvc/View");
GameHub.Controller = require("./lib/mvc/Controller");

GameHub.Utils = require("./lib/utils/Utils");
GameHub.Utils = require("./lib/utils/Debug");


module.exports = GameHub;