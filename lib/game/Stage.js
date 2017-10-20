/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

"use strict";

/* Internal Dependencies */
const Utils = require("../utils/Utils");
const Debug = require("../utils/Debug");
const GH = require("../GameHub.js");
const GameObject = require("../core/GameObject");

const State = require("./State");

/**
 * Class representing a Stage
 * 
 * @extends GameObject
 */
class Stage extends GameObject {

	/**
	 * Creates a new Stage
	 * 
	 * @constructor
	 * @param {Object} a_options Stage creation options
	 */
	constructor(a_options) {
		super();

		/* --- Stage Properties --- */

		//Per stage data storage
		this.initialModel = new Object();

		this.model = Utils.Clone(this.initialModel);

		//Array of states defined for this stage
		this.states = new Array();

		//Current state index
		this.currentStateIdx = -1;

		/* --- Internal Connections --- */

		//GameMode responsible for Stage
		this.parentGM = null;

		/* --- Finalize Constructor --- */

		//Starts formatting
		this.startFormat(a_options);
	}

	/**
	 * Fills the Stage object with options provided
	 * @param {Object} a_options 
	 */
	format(a_options) {
		var self = this;

		return new Promise((resolve, reject) => {

			/* --- Pre Checks --- */

			//Early out if options invalid
			if (!Utils.Valid(a_options))
				reject("Invalid Stage Options");

			/* --- Stage Properties --- */

			//GameMode responsible for Stage
			if (Utils.Valid(a_options.parentGM))
				self.parentGM = a_options.parentGM;

			//Path of source code if specified
			if (!Utils.Valid(self.src))
				if (Utils.Valid(a_options.src)) {
					self.setSrc(a_options.src);
				}

			//Per stage data storage
			if (Utils.Valid(a_options.model))
				self.initialModel = a_options.model;

			self.model = Utils.Clone(self.initialModel);

			//Array of states defined for this stage
			if (Utils.Valid(a_options.states))
				self.states = a_options.states;

			/* --- Stage Callbacks --- */

			//Stage enter callback
			if (a_options.onEnter)
				self.on("enter", a_options.onEnter);

			//Stage exit callback
			if (a_options.onExit)
				self.on("exit", a_options.onExit);

			// On State Change Callback
			if (Utils.Valid(a_options.onStateChange))
				self.on("stateChange", a_options.onStateChange);

			//States
			var sttPromise = new Promise(function (sttResolve, sttReject) {
				if (Utils.Valid(a_options.states)) {
					var statePromises = new Array();

					//Loop through provided states
					for (var i = 0; i < Utils.Length(a_options.states); i++) {
						var idx = i;
						statePromises.push(new Promise(function (stiResolve /*, stiReject*/ ) {

							var stateOptions = a_options.states[idx];
							stateOptions.parentStage = self;
							stateOptions.onLoad = function () {
								stiResolve();
							};

							var newState = new State(stateOptions);
							//Store stage in gm, not options object
							self.states[idx] = newState;
						}));
					}

					Promise.all(statePromises).then(function () {
						sttResolve();
					}).catch(a_reason => {
						sttReject(a_reason);
					});
				} else
					sttResolve();
			});

			Promise.all([super.format(a_options), sttPromise]).then(function () {
				resolve();
			}).catch(reason => {
				Debug.Error("Could not resolve all promises to load Stage");
				Debug.Error(reason);
				reject(reason);
			});
		});
	}

	/**
	 * Resets stage to initial settings, resets model to initially defined
	 */
	reset() {
		//TODO: Fix more permanently!
		this.model = Utils.Clone(this.initialModel);

		//Reset all child states
		for (var i = 0; i < this.states.length; i++) {
			this.states[i].reset();
		}

		//Reset current state to 0
		this.setCurrentState(0);

		//Emit event 'on reset'
		this.emit("reset");

		this.log("Reset Stage - " + this.name);
	}

	/**
	 * Called when stage is entered
	 */
	enter() {
		//Emit event 'on enter'
		this.emit("enter", this); //Moved so callbacks are fired before views sent

		//TODO: Fix this
		if (this.currentStateIdx > 0)
			this.reset();
		else
			this.setCurrentState(0);

		this.log("Entered Stage - " + this.name);
	}

	/**
	 * Called when stage is exited
	 */
	exit() {
		//Emit event 'on exit'
		this.emit("exit", this);

		this.log("Exited Stage - " + this.name);
	}

	/**
	 * Get current state from index if available
	 * @param {Int} stateIdx 
	 */
	getState(stateIdx) {
		//If state exists, return
		if (stateIdx >= 0 && stateIdx < this.states.length) {
			var state = this.states[stateIdx];
			//this.log("Found state [" + state.name + "] at index: " + stateIdx);
			return state;
		}

		//State does not exist
		Debug.Warning("State does not exist for index: " + stateIdx + ". Returning null!");
		return null;
	}

	/**
	 * Getter to get the current state
	 */
	get currentState() {
		return this.getState(this.currentStateIdx);
	}

	/**
	 * Setter to set the current state
	 * @param {Int} a_idx 
	 */
	setCurrentState(a_idx) {
		//Check if valid state
		if (a_idx >= 0 && a_idx < this.states.length) {
			if (this.currentStateIdx >= 0)
				this.currentState.exit();

			this.log("Resetting Roles If Needed");
			//GH.deviceManager.devices.forEach(function (a_device) {
			//	//Should a_device reset role...
			//	if (a_device.shouldResetRole)
			//		a_device.reset();
			//}, this);

			this.currentStateIdx = a_idx;
			this.currentState.enter();
			//this.emit("changedState", this.currentStateIdx);
			this.emit("stateChange", this.currentState);

			//GH.deviceManager.broadcastState(GH.activeGameMode.currentStage.currentState);
		}
	}

	/**
	 * Overridable function to validate the stage
	 */
	isValidated() {
		return true;
	}

	/**
	 * Progresses the Stage if the current state is validated
	 */
	progressStage() {
		this.log("Progressing Stage");
		//Early exit if state is not valid to be left
		if (!this.getState(this.currentState).isValidated())
			return;

		//If valid next state, set current state to next
		if (this.nextStateIdx >= 0)
			this.currentStateIdx = this.nextStateIdx;
	}

	/**
	 * Execute the current stage
	 */
	execute() {
		//Emit event 'on execute'
		this.emit("execute");

		this.log("Executing stage " + this.name);
	}

	/**
	 * Exentisble function to get context aware path
	 */
	getProperPath(a_src) {
		var srcDir = a_src.split("/"),
			outPath = "";

		if (!Utils.IsAbsolutePath(a_src)) {
			if (Utils.Valid(this.parentGM))
				outPath = this.parentGM.path;
		} else if(!Utils.Valid(this.parentGM)) {
			outPath += "/../../";
		}

		if (Utils.Valid(this.path)){
			if (srcDir[0] !== "stages")
				outPath += this.path;
		}

		return outPath;
	}

	/**
	 * Logs out important debug properties of the stage
	 */
	debug() {
		this.log("Name - " + this.name);
		this.log("Model Variables - " + Utils.Length(this.model));
		this.log("Number of States - " + Utils.Length(this.states));

		for (var i = 0; i < Utils.Length(this.states); i++) {
			this.log("State (" + i + ") - " + this.states[i].name);
			//this.log("- State: " + this.states[i].name);    
			this.states[i].debug();
		}
	}
}

// -- Exports Stage Class

module.exports = Stage;