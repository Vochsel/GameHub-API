/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

/* Internal Dependencies */
const Utils         = require("../utils/Utils");
const Debug         = require("../utils/Debug");
const BaseObject    = require("./BaseObject");

/**
 * Class representing a Resource
 * 
 * @extends BaseObject
 */
class Resource extends BaseObject {

	/**
     * Creates a new Resource
     * 
     * @constructor
     * @param {Object} a_options Resource creation options
     */
	constructor(a_options) {
		super();

		/* --- State Properties --- */

		//Actual data of the resource
		this.data = "";

		/* --- Internal Connections --- */

		//GameMode responsible for Stage
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

		return new Promise(function (resolve, reject) {

			/* --- Pre Checks --- */

			//Early out if options invalid
			if (!Utils.Valid(a_options))
				reject("Options not valid");

			/* --- State Properties --- */

			//Literal name of State
			if (Utils.Valid(a_options.name))
				self.name = a_options.name;

			//GameMode responsible for Stage
			if (Utils.Valid(a_options.parentGM))
				self.parentGM = a_options.parentGM;

			//Actual data of the Resource
			if (Utils.Valid(a_options.data))
				self.data = a_options.data;

			//Path of source code if specified
			if (Utils.Valid(a_options.src)) 
				self.setSrc(a_options.src);

			/* --- State Callbacks --- */

			//State load callback
			if (a_options.onLoad)
				self.on("load", a_options.onLoad);

			/* --- External Resource --- */

			//Handle external source
			var srcPromise = new Promise(function (srcResolve, srcReject) {
				if (Utils.Valid(a_options.src)) {
					var rPath = "";
					if(!Utils.IsAbsolutePath(a_options.src)) {
						if(Utils.Valid(self.parentGM))
							rPath = self.parentGM.path;
					}
                    
					Utils.LoadFileAsync(rPath + a_options.src).then(value => {
						if(Utils.IsArray(value)) {
							self.data = value;
							srcResolve();
						}
						else {
							self.format(value).then(function () {
								srcResolve();
							});
						}
						//console.log(self.data);
					}).catch(reason => {
						Debug.Error("Could not load src: " + a_options.src);
						Debug.Error(reason);
						srcReject(reason);
					});
				} else {
					srcResolve();
				}
			});

			Promise.all([srcPromise]).then(function () {
				resolve();
			}).catch(reason => {
				Debug.Error("Could not resolve all promises to load Stage");
				Debug.Error(reason);
				reject(reason);
			});
		});
	}
}

// -- Exports Resource Class

module.exports = Resource;