const chalk = require("chalk");

const Utils = require("./Utils");

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

	// -- Basic static log function
	static Log(a_msg, a_colour = "white") {
		//Should log to console?
		if (!Debug.ShouldLogToConsole)
			return;


		//Convert to lowercase
		var colourLiteral = a_colour.toLowerCase();

		//Check if valid colour, else set to white
		if (!chalk[colourLiteral])
			colourLiteral = Debug.RandomColor(colourLiteral);
		//colourLiteral = "white"

		var message = a_msg;
		if (typeof a_msg === "object" || Object.is(a_msg))
			message = JSON.stringify(a_msg);

		//Console log with specified colour
		console.log(chalk[colourLiteral](((Debug.LogPrefix != "") ? "[" + Debug.LogPrefix + "] " : "") + message));
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

// -- Exports Debug Class

module.exports = Debug;