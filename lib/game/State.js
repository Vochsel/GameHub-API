/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

"use strict";

/* External Dependencies */
const Eval = require("safe-eval");

/* Internal Dependencies */
const Utils = require("../utils/Utils");
const Debug = require("../utils/Debug");

const BaseObject = require("../core/BaseObject");

const View = require("../mvc/View.js");
const Controller = require("../mvc/Controller.js");

/**
 * Class representing a State
 * 
 * @extends BaseObject
 */
class State extends BaseObject {

	/**
	 * Creates a new State
	 * 
	 * @constructor
	 * @param {Object} a_options State creation options
	 */
	constructor(a_options) {
		super();

		/* --- State Properties --- */

		//Per state data storage
		this.initialModel = new Object();
		this.model = Utils.Clone(this.initialModel);

		//Domain specific controllers for state
		this.controllers = new Array();

		//Domain specific views for state
		this.views = new Array();

		/* --- Internal Connections --- */

		//Stage responsible for this State
		this.parentStage = null;

		/* --- Finalize Constructor --- */

		//Starts formatting
		this.startFormat(a_options);
	}

	/**
	 * Fills the State object with options provided
	 * @param {Object} a_options 
	 */
	format(a_options) {
		var self = this;

		return new Promise(function (resolve, reject) {

			/* --- Pre Checks --- */

			//Early out if options invalid
			if (!Utils.Valid(a_options))
				reject("Invalid State Options");

			/* --- State Properties --- */

			//Literal name of State
			if (Utils.Valid(a_options.name))
				self.name = a_options.name;

			//Path of source code if specified
			if (!Utils.Valid(self.src))
				self.setSrc(a_options.src);

			//Stage responsible for this state
			if (Utils.Valid(a_options.parentStage))
				self.parentStage = a_options.parentStage;

			// -- Model

			//Per State data storage
			if (Utils.Valid(a_options.model))
				self.initialModel = a_options.model;

			self.model = Utils.Clone(self.initialModel);

			// -- Controllers

			//Domain specific controller for state
			if (Utils.Valid(a_options.controllers))
				self.controllers = Array.from(a_options.controllers);

			// -- Views

			//Domain specific views for state, loading comes later...
			if (Utils.Valid(a_options.views))
				self.views = Array.from(a_options.views);

			/* --- State Callbacks --- */

			//State load callback
			if (a_options.onLoad)
				self.on("load", a_options.onLoad);

			//State enter callback
			if (a_options.onEnter)
				self.on("enter", a_options.onEnter);

			//State exit callback
			if (a_options.onExit)
				self.on("exit", a_options.onExit);

			//Is State Validated
			if (a_options.isValidated)
				self.isValidated = a_options.isValidated;


			/* --- External Source --- */

			//Handle external source
			var loadSrcPromise = new Promise(function (srcResolve, srcReject) {
				if (Utils.Valid(a_options.src)) {
					var rPath = "";
					if (!Utils.IsAbsolutePath(a_options.src)) {
						if (Utils.Valid(self.parentStage))
							if (Utils.Valid(self.parentStage.parentGM))
								rPath = self.parentStage.parentGM.path;
							else
								rPath = self.parentStage.path;
					}

					Utils.LoadFileAsync(rPath + a_options.src, false, true).then(value => {
						var content = value.content;
						var type = value.fileType;
						switch(type)
						{
							case "js":
								var exp = {};
								var robj = Eval(content , Object.assign(Utils.GH_API, {exports: exp}/*a_opts*/));
								console.log("HGHGHGH");
								if(Utils.Valid(robj) && Utils.Valid(exp))
									console.log(exp);
									self.format(exp).then(function () {
										srcResolve();
									});
								break;
							case "json":
								var cnt = JSON.parse(content);
								self.format(cnt).then(function () {
									srcResolve();
								});
								break;
							default:
								self.format(content).then(function () {
									srcResolve();
								});
								break;
						}
					}).catch(reason => {
						Debug.Error("Could not load src: " + a_options.src);
						Debug.Error(reason);
						srcReject(reason);
					});
				} else {
					srcResolve();
				}
			});

			/* --- External Views --- */

			var loadViewsPromise = new Promise(function (viewResolve, viewReject) {
				if (Utils.Valid(a_options.views)) {
					var viewPromises = new Array();

					//Loop through provided views
					for (var i = 0; i < Utils.Length(a_options.views); i++) {
						var idx = i;
						viewPromises.push(new Promise(function (vResolve /*, vReject*/ ) {

							var viewOptions = a_options.views[idx];
							viewOptions.parentState = self;

							viewOptions.onLoad = function () {
								vResolve();
							};

							//Store state in gm, not options object
							self.views[idx] = new View(viewOptions);
						}));
					}

					Promise.all(viewPromises).then(function () {
						viewResolve();
					}).catch(function (a_reason) {
						viewReject(a_reason);
					});
				} else
					viewResolve();
			});

			/* --- Load Controllers --- */

			var loadControllersPromise = new Promise(function (controllerResolve, controllerReject) {
				if (Utils.Valid(a_options.controllers)) {
					var controllerPromises = new Array();

					//Loop through provided controllers
					for (var i = 0; i < Utils.Length(a_options.controllers); i++) {
						var idx = i;
						controllerPromises.push(new Promise(function (cResolve /*, cReject*/ ) {

							var controllerOptions = a_options.controllers[idx];
							controllerOptions.parentState = self;

							controllerOptions.onLoad = function () {
								cResolve();
							};

							//Store state in gm, not options object
							self.controllers[idx] = new Controller(controllerOptions);
						}));
					}

					Promise.all(controllerPromises).then(function () {
						controllerResolve();
					}).catch(function (a_reason) {
						controllerReject(a_reason);
					});
				} else
					controllerResolve();
			});


			Promise.all([loadSrcPromise, loadViewsPromise, loadControllersPromise]).then(function () {
				resolve();
			}).catch(reason => {
				Debug.Error("Could not resolve all promises to load State");
				Debug.Error(reason);

				reject(reason);
			});
		});
	}

	/**
	 * Resets state and restores model to initally defined
	 */
	reset() {
		//Emit event 'on reset'
		this.emit("reset");

		//TODO: Fix more permanently!
		this.model = Utils.Clone(this.initialModel);

		this.log("Reset State - " + this.name);
	}

	/**
	 * Called when state is entered
	 */
	enter() {
		//Emit event 'on enter'
		this.emit("enter");

		this.log("Entered State - " + this.name);
	}

	/**
	 * Called when state is exited
	 */
	exit() {
		//Emit event 'on exit'
		this.emit("exit");

		this.log("Exited State - " + this.name);
	}

	/**
	 * Overridable function to validate the state
	 */
	isValidated() {
		return true;
	}

	// -- Utilitiy Functions

	/**
	 * Find the most appropriate view for device given (a_device)
	 * 
	 * @param {Device} a_device 
	 */
	getBestViewForDevice(a_device) {
		//Create ref for when second best view is found
		var defaultView = null;

		//Loop through all views associated with this state
		for (var i = 0; i < this.views.length; i++) {
			var view = this.views[i];

			//Log out device type and desired view type            
			//this.log("Role = " + a_device.role + " : " + view.role);

			//Check if type matches
			if (a_device.type === view.type /*|| a_device.type === "default"*/ ) {
				//If role is default, store incase no other found...
				if (view.role === "default")
					defaultView = view;
				//Check if role matches
				if (a_device.role === view.role) {
					//Found best view for device
					this.log("Found view for Device Type: " + a_device.type + ", Role: " + a_device.role);
					return view;
				}
			}
		}

		//If found default view, return that, otherwise null
		return (defaultView) ? defaultView : null;
	}

	/**
	 * Logs out important debug properties of state
	 */
	debug() {
		this.log("Name - " + this.name);
		this.log("Model Variables - " + Utils.Length(this.model));
		this.log("Controller Functions - " + Utils.Length(this.controller));
		this.log("Views - " + Utils.Length(this.views));
		for (var i = 0; i < Utils.Length(this.views); i++) {
			this.log("  - Type: " + this.views[i].type + ". Role: " + this.views[i].role);
		}
	}
}


// -- Exports State Class

module.exports = State;