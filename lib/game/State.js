/*!
 * gh-api: GameHub API
 * Copyright(c) 2017 Ben Skinner (benjamin.skinner96@gmail.com)
 * Source is provided as reference for a personal university assignment with CIT.
 */

'use strict';

/* External Dependencies */
const EventEmitter = require('events');

/* Internal Dependencies */
const Utils = require('../utils/Utils');
const Debug = require('../utils/Debug');
const GH = require('../GameHub.js');

const BaseObject = require("../core/BaseObject");

const View = require('../mvc/View.js');

/**
 * Class representing a State
 * 
 * @extends BaseObject
 */
class State extends BaseObject {

    /**
     * Creates a new State
     * 
     * @constructor
     * @param {Object} a_options State creation options
     */
    constructor(a_options) {
        super();

        /* --- State Properties --- */

        //Literal name of the state
        this.name = "Untitled State";

        //Source file is specified
        this.src = "";
        
        //Path of source file if specified 
        this.path = "";

        //Per state data storage
        this.initialModel = new Object();
        this.model = Utils.Clone(this.initialModel);

        //Domain specific controller for state
        this.controller = new Object();

        //Domain specific views for state
        this.views = new Array();

        /* --- Internal Connections --- */

        //Stage responsible for this State
        this.parentStage = null;

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

            //Path of source code if specified
            if (Utils.Valid(a_options.src)) 
                self.setSrc(a_options.src);

            //Stage responsible for this state
            if (Utils.Valid(a_options.parentStage))
                self.parentStage = a_options.parentStage;

            // -- Model

            //Per State data storage
            if (Utils.Valid(a_options.model))
                self.initialModel = a_options.model;

            self.model = Utils.Clone(self.initialModel);

            // -- Controllers

            //Domain specific controller for state
            if (Utils.Valid(a_options.controller))
                self.controller = a_options.controller;

            // -- Views

            //Domain specific views for state, loading comes later...
            if (Utils.Valid(a_options.views))
                self.views = Array.from(a_options.views);

            //Array of states defined for this state
            if (Utils.Valid(a_options.states))
                self.states = a_options.states;

            /* --- State Callbacks --- */

            //State load callback
            if (a_options.onLoad)
                self.on("load", a_options.onLoad);

            //State enter callback
            if (a_options.onEnter)
                self.on("enter", a_options.onEnter);

            //State exit callback
            if (a_options.onExit)
                self.on("exit", a_options.onExit);

            //Is State Validated
            if (a_options.isValidated)
                self.isValidated = a_options.isValidated;


            /* --- External Source --- */

            //Handle external source
            var srcPromise = new Promise(function (srcResolve, srcReject) {
                if (Utils.Valid(a_options.src)) {
                    Utils.LoadFileAsync((Utils.Valid(self.parentStage) ? self.parentStage.parentStage.path : "") + a_options.src).then(value => {

                        self.format(value).then(function () {
                            srcResolve();
                        });
                    }).catch(reason => {
                        Debug.Error("Could not load src: " + a_options.src);
                        Debug.Error(reason);
                        srcReject(reason);
                    });
                } else {
                    srcResolve();
                }
            }).then(value => {

            }).catch(reason => {
                Debug.Error("Could not load state from external source");
                Debug.Error(reason);
            });

            /* --- External Views --- */

            var viewsPromise = new Promise(function (viewResolve, viewReject) {
                if (Utils.Valid(a_options.views)) {
                    var viewPromises = new Array();

                    //Loop through provided views
                    for (var i = 0; i < Utils.Length(a_options.views); i++) {
                        var idx = i;
                        viewPromises.push(new Promise(function (vResolve, vReject) {

                            var viewOptions = a_options.views[idx];
                            viewOptions.parentState = self;

                            viewOptions.onLoad = function () {
                                vResolve();
                            }

                            var newView = new View(viewOptions);
                            //Store state in gm, not options object
                            self.views[idx] = newView;
                        }));
                    }

                    Promise.all(viewPromises).then(value => {
                        viewResolve();
                    }).catch(reason => {
                        viewReject(reason);
                    });
                } else
                    viewResolve();
            }).then(function () {

            }).catch(reason => {
                Debug.Error("Could not load Views for State")
                Debug.Error(reason);
            });


            Promise.all([srcPromise, viewsPromise]).then(function () {
                resolve();
            }).catch(reason => {
                Debug.Error("Could not resolve all promises to load State");
                Debug.Error(reason);
            })
        });
    }

    reset() {
        Debug.Log("Reset State - " + this.name, "magenta");
        //TODO: Fix more permanently!
        this.model = Utils.Clone(this.initialModel);
        //Emit event 'on reset'
        this.emit("reset");
    }

    // -- Called when state is entered
    enter() {
        Debug.Log("Enter State - " + this.name, 'magenta');

        //Emit event 'on enter'
        this.emit("enter");
    }

    // -- Called when state is exited
    exit() {

        Debug.Log("Exit State - " + this.name, 'magenta');

        //Emit event 'on exit'
        this.emit("exit");
    }

    // -- Overridable function to validate the state
    isValidated() {
        //return true;
        //return this.isValidated();
    }

    // -- Utilitiy Functions

    //Find the most appropriate view for device given (a_device)
    getBestViewForDevice(a_device) {
        //Create ref for when second best view is found
        var defaultView = null;

        //Loop through all views associated with this state
        for (var i = 0; i < this.views.length; i++) {
            var view = this.views[i];

            //Log out device type and desired view type            
            //Debug.Log("Type = " + a_device.type + " : " + view.type, "red");
            //Log out device role and desired view role
            //Debug.Log("Role = " + a_device.role + " : " + view.role, "red");

            //Check if type matches
            if (a_device.type === view.type /*|| a_device.type === "default"*/) {
                //If role is default, store incase no other found...
                if (view.role === "default")
                    defaultView = view;
                //Check if role matches
                if (a_device.role === view.role) {
                    //Found best view for device
                    Debug.Log("Found view for Device Type: " + a_device.type + ", Role: " + a_device.role, "red");
                    return view;
                }
            }
        }

        //If found default view, return that, otherwise null
        return (defaultView) ? defaultView : null;
    }

    log() {
        Debug.Log("[State] Name - " + this.name, "magenta");
        Debug.Log("[State] Model Variables - " + Utils.Length(this.model), "magenta");
        Debug.Log("[State] Controller Functions - " + Utils.Length(this.controller), "magenta");
        Debug.Log("[State] Views - " + Utils.Length(this.views), "magenta");
        for (var i = 0; i < Utils.Length(this.views); i++) {
            Debug.Log("[State]   - Type: " + this.views[i].type + ". Role: " + this.views[i].role, "magenta");
        }
    }
}


// -- Exports State Class

module.exports = State;