/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

"use strict";

/* External Dependencies */
const EventEmitter = require("events");

/* Internal Dependencies */
const Utils = require("../utils/Utils");
const Debug = require("../utils/Debug");

/**
 * Class containing common elements of each GameMode object
 * 
 * @extends EventEmitter
 */
class BaseObject extends EventEmitter {

	/**
	 * Creates a new Base Object with common properties
	 * 
	 * @constructor
	 */
	constructor() {
		super();

		/* --- Internal Reflection --- */

		//Gets the name of this class, used for debugging and internal reflection
		this.__className = this.constructor.name;

		/* --- Common Properties --- */

		//Literal name of Base Object
		this.name = "Untitled " + this.className;

		/* --- Internal callbacks --- */

		this.on("load", () => {
			this.log("Loaded!");
		});
	}

	/**
	 * Begin the formatting process for this Object
	 * @param {Object} a_options 
	 */
	startFormat(a_options) {
		var self = this;

		/* --- Format with options passed --- */
		this.format(a_options).then(function () {
			self.emit("load");
		}).catch(function (a_reason) {
			Debug.Error(a_reason.message);
			Debug.Error(a_reason.stack);
		});
	}

	/**
	 * Abstract format promise funciton
	 * @param {Object} a_options 
	 */
	format(a_options) {
		var self = this;

		return new Promise(function (resolve, reject) {
			if (!Utils.Valid(a_options))
				reject("Invalid options passed: " + self.__className);

			//Literal name of GameMode
			if (Utils.Valid(a_options.name))
				self.name = a_options.name;

			/* --- Callbacks --- */

			// On Load Callback
			if (Utils.Valid(a_options.onLoad))
				self.on("load", a_options.onLoad);

			resolve();
		});
	}

	/**
	 * Utility function to log out from the current object
	 * @param {*} a_message 
	 */
	log(a_message) {
		Debug.Log("[" + this.className + " : " + this.name + "] - " + a_message, this.className, this.className);
	}

	/**
	 * Getter for Base Object class name, can be overidden
	 */
	get className() {
		return this.__className;
	}
}

module.exports = BaseObject;