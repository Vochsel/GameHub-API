/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

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
		this.name = "Untitled " + this.__className;

		//Source file is specified
		this.src = "";
        
		//Path of source file if specified 
		this.path = "";
    
		/* --- Internal callbacks --- */

		this.on("load", function () {
			Debug.Log("[" + this.__className + "] Loaded!", this.__className);
		});

		/* --- Debug Info --- */

		Debug.Log("[" + this.__className + "] Created!", this.__className);
	}

	startFormat(a_options) {
		var self = this;
		
		/* --- Format with options passed --- */
		this.format(a_options).then(function() {
			self.emit("load");
		}).catch(function(a_reason) {
			Debug.Error(a_reason);
		});
	}

	/**
     * Abstract format promise funciton
     * @param {Object} a_options 
     */
	format(a_options) {
		return new Promise(function(resolve, reject) {
			if(Utils.Valid(a_options))
				resolve();
			else
				reject();
		});
	}

	/**
     * Set the source path of external file
     * @param {String} a_src 
     */
	setSrc(a_src) {
		//Early out if a_src not valid
		if(!Utils.Valid(a_src)) {
			Debug.Error("Could not set source; Invalid: " + a_src);
			return;
		}

		//Set src path
		this.src = a_src;

		//Set actual path
		this.path = this.src.substring(0, this.src.lastIndexOf("/")) + "/";
	}
}

module.exports = BaseObject;