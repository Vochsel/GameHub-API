/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

"use strict";

/* External Dependencies */
const EventEmitter = require("events");

/* Internal Dependencies */
const Debug = require("../utils/Debug.js");
const Utils = require("../utils/Utils.js");

/**
 * Class representing a Device
 * 
 * @extends EventEmitter
 */
class Device extends EventEmitter {

	/**
	 * Creates a new Device
	 * 
	 * @constructor
	 * @param {Object} a_options Device creation options
	 */
	constructor(a_options) {
		//Call Event Emitter constructor
		super();

		/* --- Device Properties --- */

		//Name of the device
		this.name = "No Device Name";

		//Store reference to client socket
		this.socket = null;

		//Client IP address
		this.clientIP = "No Client IP";

		//Type of device, this determines which view it will recieve
		this.initialType = "default";

		//Role of device, determines which sub view device will get
		this.initialRole = "default";

		//Device unique ID
		this.uid = -1;

		/* --- Internal Variables --- */

		//Should device refresh view
		this.shouldRefreshView = false;

		//Should device reset role on state change
		this.shouldResetRole = false;

		/* --- Finalize Constructor --- */

		//Starts setup
		this.startSetup(a_options);
	}

	/**
	 * Begin the setup process for this Device
	 * @param {Object} a_options 
	 */
	startSetup(a_options) {
		var self = this;

		/* --- Setup with options passed --- */
		this.setup(a_options).then(function () {
			self.emit("setup");
		}).catch(function (a_reason) {
			Debug.Error(a_reason);
		});
	}

	/**
	 * Sets up the Device object with options provided
	 * @param {Object} a_options 
	 */
	setup(a_options) {
		var self = this;

		return new Promise(function (resolve, reject) {

			/* --- Pre Checks --- */

			//Early out if options invalid
			if (!Utils.Valid(a_options))
				reject("Invalid Device Properties");

			/* --- Device Properties --- */

			//Name of the device
			if (Utils.Valid(a_options.name))
				self.name = a_options.name;

			//Set the socket and store client IP
			if (Utils.Valid(a_options.socket))
				self.setSocket(a_options.socket);

			//Type of device, this determines which view it will recieve
			if (Utils.Valid(a_options.type))
				self.initialType = self.type = a_options.type;

			//Role of device, determines which sub view device will get
			if (Utils.Valid(a_options.role))
				self.initialRole = self.role = a_options.role;

			//Device unique ID
			self.uid = self.generateUID();

			//Resolve promise
			resolve();
		});
	}

	/**
	 * Creates a unique ID from IP, type, and role of device
	 */
	generateUID() {
		return this.clientIP + "-" + this.initialType + "-" + this.initialRole;
	}

	/**
	 * Send a message with type and data to device's socket
	 * @param {String} a_type 
	 * @param {String} a_data 
	 */
	sendMessage(a_type, a_data) {
		this.socket.send(JSON.stringify({type:a_type, data:a_data}));
	}

	/**
	 * Sent proper view from a_state, correctly formatted for device delivery
	 * @param {State} a_state 
	 * @param {GameMode} a_gamemode
	 */
	sendState(a_state, a_gamemode) {
		//Get best view
		var view = a_state.getBestViewForDevice(this);

		//Check if found view
		if (!view)
			return Debug.Error("Could not find view for device [" + this.uid + "] in " + a_state.name + "!");

		//Format view with provided object
		var viewSrc = Utils.FormatStringWithData(view.data, {
			gm: a_gamemode,
			stage: a_gamemode.currentStage,
			state: a_gamemode.currentStage.currentState.model
		}); //maybe move to controller?

		//Send view
		this.sendMessage("view", viewSrc);

		//Send out success log message
		this.log("Sent view to device");
	}

	/**
	 * Check if device is alive
	 */
	checkStatus() {
		if (this.socket.isAlive === false) {
			this.socket.terminate();
			return false;
		}

		this.socket.isAlive = false;
		this.socket.ping("", false, true);
		return true;
	}

	/**
	 * Resets the device's role and type to initially defined
	 */
	reset() {
		this.emit("reset");
		this.role = this.initialRole;
		this.type = this.initialType;
	}

	/**
	 * 
	 */
	refreshView() {
		this.emit("refresh");
	}

	/**
	 * Sets the device's socket and updates the client IP address
	 * @param {Socket} a_socket 
	 */
	setSocket(a_socket) {
		//Store reference to device client socket
		this.socket = a_socket;

		//Client IP address
		this.clientIP = this.socket._socket.remoteAddress;
	}

	/**
	 * Utility function to log out from the current object
	 * @param {*} a_message 
	 */
	log(a_message) {
		Debug.Log("[" + this.__className + "] " + a_message, this.__className);
	}
}

// -- Exports Device Class

module.exports = Device;