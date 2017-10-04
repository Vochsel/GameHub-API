/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */
/* External Dependencies */
const EventEmitter = require('events');

/* Internal Dependencies */
const Utils = require('../utils/Utils');
const Debug = require('../utils/Debug');
const State = require('../game/State');

/**
 * Class representing a View
 * 
 * @extends EventEmitter
 */
class View extends EventEmitter {

    /**
     * Creates a new View
     * 
     * @constructor
     * @param {Object} a_options View creation options
     */
    constructor(a_options) {
        super();

        /* --- View Properties --- */

        //Literal name of View
        this.name = "Untitled View";

        //Type associate with View
        this.type = "default";

        //Role associated with View
        this.role = "default";

        //Data for View
        this.data = "Invalid Data";

        /* --- Internal callbacks --- */

        this.on("load", function () {
            Debug.Log("[View] Loaded View", "gray");
        })

        /* --- View Debug Info --- */

        Debug.Log("[View] Created View", "gray");

        /* --- Format with options passed --- */

        this.format(a_options).then(value => {
            this.emit("load");
        }, reason => {
            Debug.Error(reason);
        });

    }

    /**
     * Fills the View object with options provided
     * @param {Object} a_options 
     */
    format(a_options) {
        var self = this;

        return new Promise(function (resolve, reject) {
            // -- Check

            //Early out if options invalid
            if (!Utils.Valid(a_options))
                reject("Options not valid");

            // -- Format

            //Literal name of View
            if (Utils.Valid(a_options.name))
                self.name = a_options.name;

            //Type associate with View
            if (Utils.Valid(a_options.type))
                self.type = a_options.type;

            //Role associated with View
            if (Utils.Valid(a_options.role))
                self.role = a_options.role;

            //Data for View
            if (Utils.Valid(a_options.data))
                self.data = a_options.data;

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

            //Handle external source
            var viewSrcPromise = new Promise(function (vsrcResolve, vsrcReject) {
                if (Utils.Valid(a_options.src)) {
                    Utils.LoadFileAsync(a_options.src).then(value => {
                        //self.format(value).then(function() {
                        //});
                        self.data = value;
                        vsrcResolve();
                    }, reason => {
                        Debug.Error("Could not load src of view: " + a_options.src);
                        Debug.Error(reason);
                        vsrcReject(reason);
                    })
                } else {
                    vsrcResolve();
                }
            }).then(value => {
                resolve();
            }, reason => {
                Debug.Error(reason);
            });
        });
    }
}

module.exports = View;