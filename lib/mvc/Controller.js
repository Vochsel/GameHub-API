/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

/* Internal Dependencies */
const Utils = require("../utils/Utils");
const Debug = require("../utils/Debug");
const GHAPI = require("../..");
const Eval = require("safe-eval");

const GameObject = require("../core/GameObject");

/**
 * Class representing a Controller
 * 
 * @extends GameObject
 */
class Controller extends GameObject {

	/**
	 * Creates a new Controller
	 * 
	 * @constructor
	 * @param {Object} a_options Controller creation options
	 */
	constructor(a_options) {
		super();

		/* --- Controller Properties --- */

		/* --- Internal Connections --- */

		//State connected to this view
		this.parentState = null;

		/* --- Finalize Constructor --- */

		//Starts formatting
		this.startFormat(a_options);
	}

	/**
	 * Fills the Controller object with options provided
	 * @param {Object} a_options 
	 */
	format(a_options) {
		var self = this;

		return new Promise((resolve, reject) => {

			/* --- Pre Checks --- */

			//Early out if options invalid
			if (!Utils.Valid(a_options))
				reject("Invalid Controller Options");

			// -- Format

			//Path of source code if specified
			if (Utils.Valid(a_options.src))
				self.src = a_options.src;

			//Merge functions into this object
			//TODO: Bad idea?
			Object.assign(self, a_options);

			/* --- Internal Connections --- */

			//State connected to this view
			if (Utils.Valid(a_options.parentState))
				self.parentState = a_options.parentState;

			Promise.all([super.format(a_options)]).then(function () {
				resolve();
			}).catch(reason => {
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
			if (Utils.Valid(this.parentState)) {
				if (Utils.Valid(this.parentState.parentStage)) {
					if (Utils.Valid(this.parentState.parentStage.parentGM)) {
						outPath = this.parentState.parentStage.parentGM.path;
					} else {
						if (Utils.IsAbsolutePath(this.parentState.parentStage.path))
							outPath = this.parentState.parentStage.path + "/../../";
						else
							outPath = this.parentState.parentStage.path;
					}
				} else {
					if (srcDir[0] === "states")
						outPath = this.parentState.path + "/../../"; //TODO: Make this nicer
					else
						outPath = this.parentState.path;
				}
			}
		};

		if (Utils.Valid(this.parentState))
			if (srcDir[0] !== "states")
				if(!Utils.IsAbsolutePath(this.parentState.path))
					outPath += this.parentState.path;

		return outPath;
	}
}

module.exports = Controller;