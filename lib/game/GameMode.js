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
			if (!Utils.Valid(self.src))
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
			if (Utils.Valid(a_options.onReset))
				self.on("reset", a_options.onReset);

			// On Stage Change Callback
			if (Utils.Valid(a_options.onStageChange))
				self.on("stageChange", a_options.onStageChange);

			// On Device Joined Callback
			if (Utils.Valid(a_options.onDeviceJoined))
				self.on("deviceJoined", a_options.onDeviceJoined);

			// On Device Handshake, called same time as device joined
			if (Utils.Valid(a_options.onDeviceHandshake))
				self.on("deviceHandshake", a_options.onDeviceHandshake);

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

		this.log("Reset Stage - " + this.name);
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