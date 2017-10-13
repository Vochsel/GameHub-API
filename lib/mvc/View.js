/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

/* Internal Dependencies */
const Utils = require("../utils/Utils");
const Debug = require("../utils/Debug");
const BaseObject = require("../core/BaseObject");

/**
 * Class representing a View
 * 
 * @extends BaseObject
 */
class View extends BaseObject {

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

		return new Promise(function (resolve, reject) {

			/* --- Pre Checks --- */

			//Early out if options invalid
			if (!Utils.Valid(a_options))
				reject("Invalid View Options");

			/* --- View Properties --- */

			//Literal name of View
			if (Utils.Valid(a_options.name))
				self.name = a_options.name;

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

			// On Load Callback
			if (Utils.Valid(a_options.onLoad))
				self.on("load", a_options.onLoad);

			// On Enter Callback
			if (Utils.Valid(a_options.onEnter))
				self.on("enter", a_options.onEnter);

			// On Exit Callback
			if (Utils.Valid(a_options.onExit))
				self.on("exit", a_options.onExit);


			/* --- External Source --- */

			//Handle external source
			var viewSrcPromise = new Promise(function (vsrcResolve, vsrcReject) {
				if (Utils.Valid(a_options.src)) {
					var rPath = "";
					if (!Utils.IsAbsolutePath(a_options.src)) {
						if (Utils.Valid(self.parentState))
							if (Utils.Valid(self.parentState.parentStage))
								if (Utils.Valid(self.parentState.parentStage.parentGM))
									rPath = self.parentState.parentStage.parentGM.path + self.parentState.path;
								else
									rPath = self.parentState.parentStage.path + self.parentState.path;
						else
							rPath = self.parentState.path;
					}

					Utils.LoadFileAsync(rPath + a_options.src).then(value => {
						self.data = value;
						vsrcResolve();
					}, reason => {
						Debug.Error("Could not load src of view: " + a_options.src);
						Debug.Error(reason);
						vsrcReject(reason);
					});
				} else {
					vsrcResolve();
				}
			});

			Promise.all([viewSrcPromise]).then(function () {
				resolve();
			}).catch(reason => {
				reject(reason);
			});
		});
	}
}

module.exports = View;