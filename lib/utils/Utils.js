/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner 
 * Source is provided as reference for a personal university assignment with CIT.
 */

"use strict";

/* External Dependencies */
const fs = require("fs");
const path = require("path");

/* Internal Dependencies */
const Debug = require("./Debug");
const GHAPI = require("../../");


// -- Private Utility Functions

//Create regexpression from left and right bracket identifiers
function CreateRegExSearch(lIdentifier, rIdentifier) {
	//return new RegExp("\\" + lIdentifier + "([\\s\\S]*?)\\" + rIdentifier, "g");
	//return new RegExp("\\" + lIdentifier + "([^\\" + lIdentifier + "\\" + rIdentifier + "]*|\\" + lIdentifier + "[^\\" + lIdentifier + "\\" + rIdentifier + "]*\\" + rIdentifier + ")*\\" + rIdentifier, "g");
	return new RegExp("\\" + lIdentifier + "([^\\" + lIdentifier + "\\" + rIdentifier + "]*|\\" + lIdentifier + "([^\\" + lIdentifier + "\\" + rIdentifier + "]*|\\" + lIdentifier + "[^\\" + lIdentifier + "\\" + rIdentifier + "]*\\" + rIdentifier + ")*\\" + rIdentifier + ")*\\" + rIdentifier, "g");
}

//Iterate all matches of regex
/*function SearchForRegEx(a_regex, a_source, a_callback) {
	var match = a_regex.exec(a_source);
	while (match != null) {

		a_callback(match);

		match = a_regex.exec(a_source);
	}
}*/

// -- Public Utility Functions

//Returns true if a_var is a string
exports.IsString = function (a_var) {
	return (typeof a_var == "string" || a_var instanceof String);
};

exports.IsArray = function (a_var) {
	return Array.isArray(a_var);
};

exports.IsFunction = function(a_func) {
	return typeof a_func === "function";
};

//Checks if object is valid
exports.Valid = function (a_object) {
	if (exports.IsString(a_object))
		return (a_object && a_object.length !== "");
	else
		return (a_object && a_object !== null && a_object !== undefined);
};

exports.JoinPaths = function(a_path1, a_path2) {
	var outPath = a_path1;
	if(a_path1.endsWith('/') && a_path2.startsWith('/')) {
		outPath += a_path2.substring(1, a_path2.length);
	} else if (a_path1.endsWith('/') || a_path2.startsWith('/')) {
		outPath += a_path2;
	} else {
		outPath += '/' + a_path2;
	}
	return outPath;
}

//Context aware function to return length of object
exports.Length = function (a_object) {
	if (a_object) {
		if (Array.isArray(a_object))
			return a_object.length;
		else
			return Object.keys(a_object).length;
	} else
		return null;
};

//Converts object to a map
exports.MapFromObject = function (a_object) {
	//Create empty map
	var m = new Map();

	//Iterate object keys and insert into map
	Object.keys(a_object).forEach(key => {
		m.set(key, a_object[key]);
	});

	//Return map
	return m;
};

//Helper function to access sub objects by string
exports.AccessObjectWithString = function(o, s) {
    if(typeof o !== 'object')
        return o;
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

//Replace injection literals with data
exports.FormatStringWithData = function (source, a_data) {
	//Create regex search for variables
	var regexSearch = CreateRegExSearch("{", "}");

	//Search for all valid injection literals

	var match = regexSearch.exec(source);
	while (match != null) {
		// -- Found match

		//Injection literal path
		var separatorContents = match[1].split("@");

		var injVarPath = separatorContents[0];		

		//Search for injection literal in supplied data object
		var val = exports.AccessObjectWithString(a_data, injVarPath);
		if (val !== null && val !== undefined) {
			//If val is an object, convert to array of values
			if (typeof val === "object" || Object.is(val)) {
				if(Object.values)
					val = Object.values(val);
				else
					val = Object.keys(val).map((k) => val[k]);
			}



			if (Array.isArray(val)) {
				//If val is array, use template replacement: {array}[<p>{ben}</p>]

				//Create regex search for [ ] 
				var templateSearch = CreateRegExSearch("[", "]");
				var templateSearchSrc = source.substring(match.index);

				//String to store entire result
				var res = "";

				var templateLength = 0;

				//Search for square brackets
				var templateMatch = templateSearch.exec(templateSearchSrc);
				while (templateMatch != null) {
					//var templateSrc = templateMatch[1];
					var templateSrc = templateMatch[0].substring(1, templateMatch[0].length-1);

					//Store length of template string
					templateLength += templateMatch[0].length;
					//Insert formatted template for each value in array
					for (var i = 0; i < exports.Length(val); i++) {
						var v = val[i];

						//console.log("FFFF:" + JSON.stringify(v));
						//Format template src with array iteration {}
						var idata = exports.FormatStringWithData(templateSrc, v);

						res += idata;

						if(exports.Valid(separatorContents[1]))
							if(i < (val.length - 1))
								res += separatorContents[1];

						//Maybe check if object?
					}

					//Look for next match
					templateMatch = templateSearch.exec(templateSearchSrc);

					
				}
				//Array replacement
				source = source.substring(0, match.index) + res + source.substring(match.index + match[0].length + templateLength);
				//Check source one more time... Could be better with recursion...
				source = exports.FormatStringWithData(source, a_data);
			} else {
				//Otherwise use direct replacement
				source = source.substring(0, match.index) + val + source.substring(match.index + match[0].length);
				//Check source one more time... Could be better with recursion...
				source = exports.FormatStringWithData(source, a_data);
			}

		} else {

			Debug.Warning("[Formatter] Could not find any variable called " + injVarPath + " in data supplied!");
		}
		//Solves recursion problem, likely will introduce other problems...
		//source = exports.FormatStringWithData(source, a_data);

		//Look for next match
		match = regexSearch.exec(source);
	}

	//Return formatted source
	return source;
};

/**
 * Load file from disk synchronously
 * @deprecated
 * @param {String} a_path 
 */
exports.LoadFile = function (a_path) {
	//Store ref to this for callback
	var self = this;

	//Read file asynchronously
	fs.readFileSync(a_path, function read(a_err, a_data) {

		//Error loading file
		if (a_err) {
			//Log out error message
			//Debug.Error("[Resource] Error reading file!");
			//Debug.Error("[Resource] " + a_err);

			//Emit error event
			self.emit("error", a_err);

			//Throw Error?
			throw a_err;
		}

		//Store file contents
		return a_data;
	});
};

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

exports.LoadFileAsync = function (a_path, a_isLocal, a_shouldSplit = false) {

	var filePath = (a_isLocal ? path.join(__dirname, a_path) : a_path);

	var fileType = path.extname(a_path).replace(".", "");

	//Read file asynchronously
	return new Promise(function (resolve, reject) {
		try {
			if(typeof fs.readFile === 'function') {

				// Load with fs

				fs.readFile(filePath, "utf8", function (err, buffer) {
					//If error, reject, otherwise resolve
					if (err) reject(err);
					else {
						resolve({content: buffer, fileType: fileType});
					}
				});
			} else {

				// Load with XMLHttpRequest

				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					if(this.readyState === 4) {
						if(xhr.status === 200) {
							resolve({content: this.responseText, fileType: fileType});							
						}
					}
				}
				xhr.onerror = function(error) {
					reject("XHTTP Error: " + error);
				}
				xhr.open("GET", filePath);
				xhr.send();
			}
		} catch (err) {
			reject(err);
		}
	});
};

exports.LoadResource = function (a_path, a_constructor) {
	return new Promise(function (resolve, reject) {
		//Try load file async
		exports.LoadFileAsync(a_path).then(function (a_options) {
			if (exports.Valid(a_options))
				//Resolve with new object of type {a_constructor} and params {a_options}
				resolve(new a_constructor(a_options));
			else
				reject("Could not load file async");
		});
	});
};

exports.IsAbsolutePath = function (a_path) {
	return path.isAbsolute(a_path);
};

exports.IsRemotePath = function (a_path) {
	return a_path.includes("http://");
}

exports.ChooseFirstValidPath = function (a_paths) {
	/*if(!Array.IsArray(a_paths)) {
        Debug.Warning("Paths provided not an array");
        return "";
    }*/

	for (var i = 0; i < exports.Length(a_paths); i++) {
		var p = a_paths[i];
		if (exports.Valid(p))
			return p;
	}
};

exports.JoinValidPath = function (a_paths) {
	/*if(!Array.IsArray(a_paths)) {
        Debug.Warning("Paths provided not an array");
        return "";
    }*/

	var fp = "";

	for (var i = 0; i < exports.Length(a_paths); i++) {
		var p = a_paths[i];
		if (exports.Valid(p)) {
			var np = path.normalize(p);
			if (np.slice(-1) !== "/")
				np += "/";
			fp += np;
		}
	}

	return fp;
};

exports.Random = function (a_min, a_max) {
	return Math.Random() * (a_max - a_min) + a_min;
};

//Creates hash from string
exports.HashString = function (a_string) {
	var hash = 0,
		i, chr;
	if (a_string.length === 0) return hash;
	for (i = 0; i < a_string.length; i++) {
		chr = a_string.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

//Creates Random number from seed, hashes if string
exports.RandomSeeded = function (a_seed) {
	if (exports.IsString(a_seed))
		a_seed = exports.HashString(a_seed);

	var x = Math.sin(a_seed++) * 10000;
	return Math.abs(Math.floor(x));
};

exports.RandomInt = function (a_min, a_max) {
	return Math.floor(Math.random() * (a_max - a_min) + a_min);
};

exports.Shuffle = function (a_array) {
	for (var i = a_array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = a_array[i];
		a_array[i] = a_array[j];
		a_array[j] = temp;
	}
	return a_array;
};

exports.Clone = function (a_object) {
	return JSON.parse(JSON.stringify(a_object));
};

exports.Timers = {};

exports.StartTimer = function(a_callback, a_delayInSeconds, a_ID = "default") {
	//Clear timer if ID has been used before
	if(exports.Valid(exports.Timers[a_ID])) {
		exports.ClearTimer(a_ID);
	}

	//Create new timer
	var timer = setTimeout(a_callback, a_delayInSeconds * 1000);
	exports.Timers[a_ID] = timer;
    return timer;
}

exports.ClearTimer = function(a_ID = "default") {
	//Clear timeout
	clearTimeout(exports.Timers[a_ID]);
	
	//Set a_ID timer property to null
	exports.Timers[a_ID] = null;
}

exports.Capitalize = function(a_string) {
	return a_string.charAt(0).toUpperCase() + a_string.slice(1);
}

exports.IndexObject = function(a_object, a_idx) {
	if(Object.keys) {
		var key = Object.keys(a_object)[a_idx];
		return a_object[key];
	} else return null;
}

exports.GH_API = {
	GH: {
		GameMode: GHAPI.GameMode,
		Stage: GHAPI.Stage,
		State: GHAPI.State,

		View: GHAPI.View,

		Resource: GHAPI.Resource

		/*System: {
			gm: GHub.activeGameMode,
			deviceManager: GHub.deviceManager,
			serverManager: GHub.serverManager,
		}*/
	},
	console: console,
	Debug: Debug,
	Utils: exports
}