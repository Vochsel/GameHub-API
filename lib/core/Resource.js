/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

"use strict";

/* External Dependencies */
const path = require("path");

/* Internal Dependencies */
const Utils = require("../utils/Utils");
const Debug = require("../utils/Debug");
const GameObject = require("./GameObject");

/**
 * Class representing a Resource
 * 
 * @extends GameObject
 */
class Resource extends GameObject {

	/**
	 * Creates a new Resource
	 * 
	 * @constructor
	 * @param {Object} a_options Resource creation options
	 */
	constructor(a_options) {
		super();

		/* --- Resource Properties --- */

		//Actual data of the resource
		this.data = "";

		/* --- Internal Connections --- */

		//GameMode responsible for Resource
		this.parentGM = null;

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

		return new Promise((resolve, reject) => {

			/* --- Pre Checks --- */

			//Early out if options invalid
			if (!Utils.Valid(a_options))
				reject("Invalid Resource Properties");

			/* --- Resource Properties --- */

			//GameMode responsible for Resource
			if (Utils.Valid(a_options.parentGM))
				self.parentGM = a_options.parentGM;

			//Actual data of the Resource
			if (Utils.Valid(a_options.data))
				self.data = a_options.data;

			//Path of source code if specified
			if (Utils.Valid(a_options.src))
				self.setSrc(a_options.src);

			Promise.all([super.format(a_options)/*, srcPromise*/]).then(function () {
				resolve();
			}).catch(reason => {
				Debug.Error("Could not resolve all promises to load Resource");
				Debug.Error(reason);
				reject(reason);
			});
		});
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
		} else if (!Utils.Valid(this.parentGM)) {
			outPath = path.join(outPath, "/../../");
		}

		return outPath;
	}
}

// -- Exports Resource Class

module.exports = Resource;