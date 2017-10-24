/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

"use strict";

/* Internal Dependencies */
const Utils = require("../utils/Utils");
const Debug = require("../utils/Debug");
const GameObject = require("../core/GameObject.js");
const Resource = require("../core/Resource.js");
const Stage = require("./Stage");

/**
 * Class representing a GameMode
 * 
 * @extends GameObject
 */
class GameMode extends GameObject {

	/**
	 * Creates a new GameMode
	 * 
	 * @constructor
	 * @param {Object} a_options GameMode creation options
	 */
	constructor(a_options) {
		super(a_options);

		/* --- GameMode Properties --- */

		//Version of GameMode
		this.version = "Invalid Version";

		//Per GameMode data storage
		this.initialModel = new Object();

		this.model = Utils.Clone(this.initialModel);

		//Array of all stages for this GameMode
		this.stages = new Array();

		//GameMode Resources
		this.resources = new Map();

		//GameMode Flow
		this.flow = [{
				stage: "introStage",
				repeats: 1
			},
			{
				stage: "gameStage",
				repeats: 1
			},
			{
				stage: "outroStage",
				repeats: 1
			},
		];

		//Current stage index
		this.currentStageIdx = -1;

		this.currentFlowIdx = -1;

		this.currentFlowRepeat = 0;

		/* --- Finalize Constructor --- */

		//Starts formatting
		this.startFormat(a_options);
	}

	/**
	 * Fills the GameMode object with options provided
	 * @param {Object} a_options 
	 */
	format(a_options) {
		var self = this;

		return new Promise((resolve, reject) => {

			/* --- Pre Checks --- */

			//Early out if options invalid
			if (!Utils.Valid(a_options))
				reject("Invalid GameMode Options");

			/* --- GameMode Properties --- */

			//Path of source code if specified
			if (Utils.Valid(a_options.src))
				self.setSrc(a_options.src);

			//Version of GameMode
			if (Utils.Valid(a_options.version))
				self.version = a_options.version;

			//Path of GameMode
			if (Utils.Valid(a_options.path))
				self.path = a_options.path;

			//Per GameMode data storage
			if (Utils.Valid(a_options.model))
				self.initialModel = a_options.model;

			if (Utils.Valid(self.initialModel))
				self.model = Utils.Clone(self.initialModel);

			//Flow of gm
			if (Utils.Valid(a_options.flow))
				self.flow = a_options.flow;

			/* --- Stage Callbacks --- */

			// On Enter Callback
			if (Utils.Valid(a_options.onEnter))
				self.on("enter", a_options.onEnter);

			// On Exit Callback
			if (Utils.Valid(a_options.onExit))
				self.on("exit", a_options.onExit);

			// On Exit Callback
			if (Utils.Valid(a_options.onSetup))
				self.on("setup", a_options.onSetup);

			// On Exit Callback
			if (Utils.Valid(a_options.onReset))
				self.on("reset", a_options.onReset);

			// On Stage Change Callback
			if (Utils.Valid(a_options.onStageChange))
				self.on("stageChange", a_options.onStageChange);

			//Stages
			var stgPromise = new Promise(function (stgResolve, stgReject) {
				if (Utils.Valid(a_options.stages)) {
					var stagePromises = new Array();

					//Loop through provided stages
					for (var i = 0; i < Utils.Length(a_options.stages); i++) {
						var idx = i;
						stagePromises.push(new Promise(function (stiResolve /*, stiReject*/ ) {

							var stageOptions = a_options.stages[idx];
							stageOptions.parentGM = self;
							stageOptions.onLoad = function () {
								stiResolve();
							};



							var newStage = new Stage(stageOptions);
							//Store stage in gm, not options object
							self.stages[idx] = newStage;
						}));
					}

					Promise.all(stagePromises).then(function () {
						stgResolve();
					}).catch(reason => {
						stgReject(reason);
					});
				} else
					stgResolve();
			});

			var pLoadAllResources = new Promise(function (pLAResolve, pLAReject) {
				var pResources = new Array();
				//Loop through options and load all resources
				for (var i = 0; i < Utils.Length(a_options.resources); i++) {
					pResources.push(new Promise(function (pResResolve /*, pResReject*/ ) {
						var resOptions = a_options.resources[i];
						resOptions.parentGM = self;
						resOptions.onLoad = function () {
							pResResolve();
						};
						var resource = new Resource(resOptions);
						self.addResource(resource);
					}));
				}
				//When all resources are loaded
				Promise.all(pResources).then(function () {
					pLAResolve();
				}).catch(function (reason) {
					pLAReject(reason);
				});
			});

			Promise.all([super.format(a_options), stgPromise, pLoadAllResources]).then(function () {
				resolve();
			}).catch(reason => {
				Debug.Error(reason);
				reject(reason);
			});

		});
	}

	/**
	 * Creates and resets all properties to default values
	 */
	reset() {
		//Emit event 'on reset'
		this.emit("reset");

		//Current stage index
		this.currentStageIdx = 0;
		this.currentFlowIdx = 0;
		this.currentFlowRepeat = 0;

		this.log("Reset Stage - " + this.name);
	}

	/**
	 * Initial setup of GameMode
	 */
	setup() {
		this.emit("setup");

		//TODO: Should this be an event, or own func
		//this.on("deviceHandshake", (a_device) => {
		//	if (!a_device)
		//		return;
		//	a_device.sendState(this.currentStage.currentState);
		//});

		//this.log("Setup Complete!");
	}

	/**
	 * Starts GameMode
	 */
	start() {
		this.log("Starting GameMode - " + this.name + " : " + this.version);
		
		//Emit event 'on start'
		this.emit("start");

		this.setup();

		//this.currentStageIdx = 0;
		this.currentFlowIdx = 0;
		this.currentFlowRepeat = 0;

		//this.currentStage.enter();
		this.setCurrentStage(0);
	}

	/**
	 * Stops GameMode
	 */
	stop() {
		this.log("Stoping GameMode: " + this.name);

		//Emit event 'on stop'
		this.emit("stop");
	}

	/**
	 * Get stage by index if possible
	 * @param {Int} a_idx 
	 */
	getStage(a_idx) {
		if (this.stages.length <= 0)
			return null;

		//If stage exists, return
		if (a_idx >= 0 && a_idx < this.stages.length)
			return this.stages[a_idx];

		//Stage does not exist
		Debug.Warning("Only " + this.stages.length + " stages are loaded. Stage does not exist for index: " + a_idx + " (Off by one). Returning null!");
		return null;
	}

	/**
	 * Get stage by name if available
	 * @param {String} a_name 
	 */
	getStageIdxByName(a_name) {
		//Loop through all stages
		for (var i = 0; i < this.stages.length; i++) {

			//Store ref to current iteration
			var stage = this.stages[i];

			//If stage name is the same as a_name, return
			if (stage.name === a_name)
				return i;
		}

		//No stage with name supplied has been found
		Debug.Warning("No stage was found with name: " + a_name + "! Returning null!");

		//Return null
		return null;
	}

	/**
	 * Getter to get the current stage
	 */
	get currentStage() {
		//var s = this.getStage(this.currentStageIdx);
		var s = this.getStage(this.getStageIdxByName(this.flow[this.currentFlowIdx].stage));
		if (s) return s;
	}

	/**
	 * Setter to set the current stage
	 * @param {Int} a_idx 
	 */
	setCurrentStage(a_idx) {
		//Check if valid state
		if (a_idx >= 0 && a_idx < this.stages.length) {
			if (this.currentStageIdx >= 0){
				this.currentStage.exit();
				this.currentFlowIdx += 1; //TODO: FIX WHOLE EXECUTION 
			}

			/*GH.deviceManager.devices.forEach(function(a_device) {
				//Should a_device reset role...
				if(a_device.shouldResetRole)
					a_device.reset();
			}, this);*/

			this.currentStageIdx = a_idx;
			this.emit("stageChange", this.currentStage);

			this.currentStage.enter();
			//this.emit("changedState", this.currentStageIdx);

			//GH.deviceManager.broadcastState(GH.activeGameMode.currentStage.currentState);
			return;
		}
		Debug.Error("Could not Set GM current stage - " + a_idx);
	}

	/**
	 * Progresses the GameMode if the current stage is validated
	 */
	progressGameMode() {

		var nextStateIdx = this.currentStage.currentStateIdx + 1;

		//If next state doesnt exist, go to next stage
		if (nextStateIdx >= this.currentStage.states.length) {
			//Increment how many times this flow stage has repeated...
			this.currentFlowRepeat += 1;

			//Finished stage, go to next stage
			var nextStageIdx = this.currentStageIdx + 1;


			if (this.currentFlowRepeat < this.flow[this.currentFlowIdx].repeats) {
				this.log("---------- Repeating");
				//this.setCurrentStage(this.getStageIdxByName(this.flow[this.currentFlowIdx].stage));
				this.setCurrentStage(this.currentStageIdx);
				//this.currentStage.reset();
				//this.currentStage.setCurrentState(0);

				return;
				//this.currentStage.reset();
			}


			if (nextStageIdx >= this.stages.length) {
				//Reached last stage, ending GameMode
				this.stop();
				return;
			}

			this.currentFlowRepeat = 0;

			this.setCurrentStage(nextStageIdx);

			this.log("Progressed to next Stage - " + nextStageIdx);
			return;
		}

		//Next state does exist, set to that
		//this.currentStage.currentStateIdx = nextStateIdx;
		this.currentStage.setCurrentState(nextStateIdx);

		this.log("Progressed to next State - " + nextStateIdx);
	}

	/**
	 * Overridable function to validate the stage
	 */
	isValidated() {
		if (this.currentStage.currentState.isValidated()) {
			this.log("Progressing");
			this.progressGameMode();
		}
	}

	/**
	 * Store resource in map with uid as key
	 * @param {Resource} a_resource 
	 */
	addResource(a_resource) {
		this.resources.set(a_resource.name, a_resource);
	}

	/**
	 * Exentisble function to get context aware path
	 */
	getProperPath(a_src) {
		if (!Utils.IsAbsolutePath(a_src)) {
			return this.path;
		} else return "";
	}

	/* --- Helper Log Functions --- */

	/**
	 * Logs out necessary debug details of GameMode
	 */
	debug() {
		this.log("GameMode - " + this.name + " | Version: " + this.version);
		this.log("Number of Resources - " + this.resources.size);
		this.log("Number of Stages - " + this.stages.length);

		for (var i = 0; i < this.stages.length; i++) {
			this.log("Stage (" + i + ") - " + this.stages[i].name);
			this.stages[i].debug();
		}
	}

	/**
	 * Logs out current stage and state
	 */
	logStatus() {
		return "[Stage] : " + this.currentStage.name + ". [State] : " + this.currentStage.currentState.name + ".";
	}
}

/* Export GameMode */
module.exports = GameMode;