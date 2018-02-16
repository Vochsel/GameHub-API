const chalk = require("chalk");

const Utils = require("./Utils");
const nutil = require('util');

// -- Debug Class (Logger)
class Debug {

	static RandomColor(a_seed) {
		var colors = [
			//"black",
			//"red",
			//"yellow",
			"magenta",
			"cyan",
			//"white",
			//"gray",
			//"redBright",
			"green",
			"blue",
			//"blueBright",
			//"yellowBright",
			"green",
			//"greenBright",
			//"magentaBright",
			//"cyanBright",
			//"whiteBright"
		];
		return colors[parseInt(Utils.RandomSeeded(a_seed) % Utils.Length(colors))];
	}

	static AddFlag(a_flag) {
		Debug.DebugFlags.push(a_flag);
	}

	static CheckFlag(a_flag) {
		var splitFlags = a_flag.split(' ');

		//Early out if all flag character used
		if(Debug.DebugFlags[0] === ".")
			return true;

		//Check all provided flags against all debug flags
		for(var flag of splitFlags) {
			for(var dFlag of Debug.DebugFlags) {
				if(flag === dFlag) return true;
			}
		}

		return false;
	}

	// -- Basic static log function
	static Log(a_msg, a_colour = "white", a_flags = "default") {

		//Should log to console?
		if (!Debug.ShouldLogToConsole)
			return false;

		//Only log if debug flag is allowed to log
		var canLog = Debug.CheckFlag(a_flags);
		if(!canLog)
			return false;

		//Convert to lowercase
		var colourLiteral = a_colour.toLowerCase();

		//Check if valid colour, else set to random
		if (!chalk[colourLiteral])
			colourLiteral = Debug.RandomColor(colourLiteral);
		//colourLiteral = "white"

		var message = a_msg;
		if (typeof a_msg === "object" || Object.is(a_msg))
			message = nutil.inspect(a_msg);

		//Console log with specified colour
		console.log(chalk[colourLiteral](((Debug.LogPrefix != "") ? "[" + Debug.LogPrefix + "] " : "") + message));

		return true;
	}

	// -- Warning log function    
	static Warning(a_msg) {
		Debug.Log(a_msg, "yellow");
	}

	// -- Error log function
	static Error(a_msg) {
		Debug.Log(a_msg, "red");
	}

	// -- Set Debug Log Prefix
	static SetLogPrefix(a_prefix) {
		Debug.LogPrefix = a_prefix;
	}

	// -- Reset Debug Log Prefix
	static ResetLogPrefix() {
		Debug.LogPrefix = "";
	}
}

// -- Debug Statics

//Should Debug log out to console
Debug.ShouldLogToConsole = true;

//Log prefix
Debug.LogPrefix = "";

//Initial Debug Flags
Debug.DebugFlags = ["."];

// -- Exports Debug Class

module.exports = Debug;