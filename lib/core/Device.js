/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

"use strict";

/* Internal Dependencies */
const Debug = require("../utils/Debug.js");
const Utils = require("../utils/Utils.js");
const BaseObject = require("../core/BaseObject.js");

/**
 * Class representing a Device
 * 
 * @extends BaseObject
 */
class Device extends BaseObject {

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

		//Store reference to client socket
		this.socket = null;

		//Client IP address
		this.clientIP = "No Client IP";

		//Type of device, this determines which view it will recieve
		this.initialType = this.type = "default";

		//Role of device, determines which sub view device will get
		this.initialRole = this.role = "default";

		//Per device data storage
		this.initialData = this.data = {};

		//Device unique ID
		this.uid = -1;

		/* --- Internal Variables --- */

		//Should device refresh view
		this.shouldRefreshView = false;

		//Should device reset role on state change
		this.shouldResetRole = false;

		/* --- Finalize Constructor --- */

		//Starts formatting
		this.startFormat(a_options);
	}

	/**
	 * Sets up the Device object with options provided
	 * @param {Object} a_options 
	 */
	format(a_options) {
		var self = this;

		return new Promise((resolve, reject) => {

			/* --- Pre Checks --- */

			//Early out if options invalid
			if (!Utils.Valid(a_options))
				reject("Invalid Device Properties");

			/* --- Device Properties --- */

			//Set the socket and store client IP
			if (Utils.Valid(a_options.socket))
				self.setSocket(a_options.socket);

			//Type of device, this determines which view it will recieve
			if (Utils.Valid(a_options.type))
				self.initialType = self.type = a_options.type;

			//Role of device, determines which sub view device will get
			if (Utils.Valid(a_options.role))
				self.initialRole = self.role = a_options.role;

			//Per device data storage
			if(Utils.Valid(a_options.data))
				self.initialData = self.data = a_options.data;

			//Device unique ID
			if (Utils.Valid(a_options.uid))
				self.uid = a_options.uid;
			else
				self.uid = self.generateUID();

			/* --- Stage Callbacks --- */

			//Stage enter callback
			if (a_options.onRefresh)
				self.on("refresh", a_options.onRefresh);

			//Device join callback
			if (a_options.onJoin)
				self.on("join", a_options.onJoin);

			Promise.all([super.format(a_options)]).then(() => {
				resolve();
			}).catch((reason) => {
				reject(reject);
			});
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
		if (this.socket)
			if (this.socket.readyState === this.socket.OPEN)
				this.socket.send(JSON.stringify({ type: a_type, data: a_data }));
	}

	/**
	 * Sent proper view from a_state, correctly formatted for device delivery
	 * @param {State} a_state 
	 * @param {GameMode} a_gamemode
	 */
	sendState(a_gamemode, a_stage, a_state) {
		//Get best view
		var view = a_state.getBestViewForDevice(this);

		//Check if found view
		if (!view)
			return Debug.Error("Could not find view for device [" + this.uid + "] in " + a_state.name + "!");

		this.log("Found view for Device Type: " + this.type + ", Role: " + this.role);

		//Format view with provided object
		var viewSrc = Utils.FormatStringWithData(view.data, {
			gm: a_gamemode,
			stage: a_stage,
			state: a_state,
			device: this
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
		this.data = this.initialData;
		this.shouldResetRole = false;

		//if(this.shouldRefreshView) {
		//	this.refreshView();
		//}
	}

	/**
	 * 
	 */
	refreshView() {
		this.emit("refresh");
		this.shouldRefreshView = false;
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
	 * Sets the device role and sets rest role next state change flag true
	 * @param {String} a_role New role of device
	 * @param {Bool} a_shouldRefreshView Whether this func should trigger device to refresh, defaults to false
	 */
	setRole(a_role, a_shouldRefreshView = false) {
		this.role = a_role;
		this.shouldResetRole = true;
		this.shouldRefreshView = a_shouldRefreshView;
	}

	/**
	 * Overidden getter for Device class name, can be overidden
	 */
	get className() {
		return this.__className + " : " + this.uid;
	}
}

// -- Exports Device Class

module.exports = Device;