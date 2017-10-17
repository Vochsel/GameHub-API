/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

/* Internal Dependencies */
const Utils = require("../utils/Utils");
const Debug = require("../utils/Debug");
const GameObject = require("../core/GameObject");

/**
 * Class representing a View
 * 
 * @extends GameObject
 */
class View extends GameObject {

	/**
	 * Creates a new View
	 * 
	 * @constructor
	 * @param {Object} a_options View creation options
	 */
	constructor(a_options) {
		super();

		/* --- View Properties --- */

		//Type associate with View
		this.type = "default";

		//Role associated with View
		this.role = "default";

		//Data for View
		this.data = "Invalid Data";

		/* --- Internal Connections --- */

		//State connected to this view
		this.parentState = null;

		/* --- Finalize Constructor --- */

		//Starts formatting
		this.startFormat(a_options);
	}

	/**
	 * Fills the View object with options provided
	 * @param {Object} a_options 
	 */
	format(a_options) {
		var self = this;

		return new Promise((resolve, reject) => {

			/* --- Pre Checks --- */

			//Early out if options invalid
			if (!Utils.Valid(a_options))
				reject("Invalid View Options");

			/* --- View Properties --- */

			//Path of source code if specified
			if (Utils.Valid(a_options.src))
				self.setSrc(a_options.src);

			//Type associate with View
			if (Utils.Valid(a_options.type))
				self.type = a_options.type;

			//Role associated with View
			if (Utils.Valid(a_options.role))
				self.role = a_options.role;

			//Data for View
			if (Utils.Valid(a_options.data))
				self.data = a_options.data;

			/* --- Internal Connections --- */

			//State connected to this view
			if (Utils.Valid(a_options.parentState))
				self.parentState = a_options.parentState;

			/* --- View Callbacks --- */

			// On Enter Callback
			if (Utils.Valid(a_options.onEnter))
				self.on("enter", a_options.onEnter);

			// On Exit Callback
			if (Utils.Valid(a_options.onExit))
				self.on("exit", a_options.onExit);

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
						if(Utils.IsAbsolutePath(this.parentState.parentStage.path))
							outPath = this.parentState.parentStage.path + "/../../";
						else	
							outPath = this.parentState.parentStage.path;
					}
				} else {
					if (srcDir[0] === "states")
						outPath = this.parentState.path + "/../../";	//TODO: Make this nicer
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

module.exports = View;