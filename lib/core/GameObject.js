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
const BaseObject = require("./BaseObject");

/**
 * Class containing common elements of each GameMode object
 * 
 * @extends BaseObject
 */
class GameObject extends BaseObject {

	/**
	 * Creates a new Game Object with common properties
	 * 
	 * @constructor
	 */
	constructor() {
		super();

		/* --- Common Properties --- */

		//Source file is specified
		this.src = "";

		//Path of source file if specified 
		this.path = "";
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

		return new Promise((resolve, reject) => {
			if (!Utils.Valid(a_options))
				reject("Invalid options passed: " + self.__className);

			/* --- External Source --- */

			//Handle external source
			var loadSrcPromise = new Promise(function (srcResolve, srcReject) {
				if (Utils.Valid(a_options.src)) {
					var rPath = "";
					if (!Utils.IsAbsolutePath(a_options.src)) {
						rPath = self.getProperPath(a_options.src);
					}
					//console.log(rPath + a_options.src);

					Utils.LoadFileAsync(rPath + a_options.src, false, true).then(value => {
						var content = value.content;
						var type = value.fileType;
						switch (type) {
							case "js":
								try {
									var exp = {};
									var robj = Eval(content, Object.assign(Utils.GH_API, { exports: exp }/*a_opts*/));
									if (Utils.Valid(robj) && Utils.Valid(exp)) {
										//console.log(exp);
										self.format(exp).then(function () {
											srcResolve();
										});
									}
								} catch (err) {
									console.log("Error Evaluating src [" + a_options.src + "] - " + err);
									srcReject("Error Evaluating src [" + a_options.src + "] - " + err);
								}
								break;
							case "json":
								var cnt = JSON.parse(content);
								self.format(cnt).then(function () {
									srcResolve();
								});
								break;
							case "html":
								var doc = content;
								self.format({ data: doc }).then(function () {
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

			Promise.all([super.format(a_options), loadSrcPromise]).then(value => {
				//console.log("SUPER RESOLVE");
				resolve(value);
			}).catch(reason => {
				//console.log("SUPER REJECT");
				reject(reason);
			});
		});
	}

	/**
	 * Set the source path of external file
	 * @param {String} a_src 
	 */
	setSrc(a_src) {
		//Early out if a_src not valid
		if (!Utils.Valid(a_src)) {
			Debug.Error("Could not set source; Invalid: " + a_src);
			return;
		}

		//Set src path
		this.src = a_src;

		//Set actual path
		this.path = this.src.substring(0, this.src.lastIndexOf("/")) + "/";
	}

	/**
	 * Exentisble function to get context aware path
	 */
	getProperPath() {
		return this.path;
	}

	/**
	 * Utility function to log out from the current object
	 * @param {*} a_message 
	 */
	log(a_message) {
		Debug.Log("[" + this.__className + "] " + a_message, this.__className);
	}
}

module.exports = GameObject;