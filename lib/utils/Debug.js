const chalk = require('chalk');

// -- Debug Class (Logger)
class Debug {

    // -- Basic static log function
    static Log(a_msg, a_colour = "white") {
        //Should log to console?
        if (!Debug.ShouldLogToConsole)
            return;

        //Convert to lowercase
        var colourLiteral = a_colour.toLowerCase();

        //Check if valid colour, else set to white
        if (!chalk[colourLiteral])
            colourLiteral = "white"

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
    static ResetLogPrefix(a_prefix) {
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