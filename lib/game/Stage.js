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

const State = require('./State');

/**
 * Class representing a Stage
 * 
 * @extends BaseObject
 */
class Stage extends BaseObject {

    /**
     * Creates a new Stage
     * 
     * @constructor
     * @param {Object} a_options Stage creation options
     */
    constructor(a_options) {
        super();

        /* --- Stage Properties --- */

        //Per stage data storage
        this.initialModel = new Object();

        this.model = Utils.Clone(this.initialModel);

        //Array of states defined for this stage
        this.states = new Array();

        //Current state index
        this.currentStateIdx = -1;

        /* --- Internal Connections --- */

        //GameMode responsible for Stage
        this.parentGM = null;

        /* --- Finalize Constructor --- */

        //Starts formatting
        this.startFormat(a_options);
    }

    /**
     * Fills the Stage object with options provided
     * @param {Object} a_options 
     */
    format(a_options) {
        var self = this;

        return new Promise(function (resolve, reject) {

            /* --- Pre Checks --- */

            //Early out if options invalid
            if (!Utils.Valid(a_options))
                reject("Options not valid");

            /* --- Stage Properties --- */

            //Literal name of Stage
            if (Utils.Valid(a_options.name))
                self.name = a_options.name;

            //Path of source code if specified
            if (Utils.Valid(a_options.src)) 
                self.setSrc(a_options.src);

            //GameMode responsible for Stage
            if (Utils.Valid(a_options.parentGM))
                self.parentGM = a_options.parentGM;

            //Per stage data storage
            if (Utils.Valid(a_options.model))
                self.initialModel = a_options.model;

            self.model = Utils.Clone(self.initialModel);

            //Array of states defined for this stage
            if (Utils.Valid(a_options.states))
                self.states = a_options.states;

            /* --- Stage Callbacks --- */

            //Stage load callback
            if (a_options.onLoad)
                self.on("load", a_options.onLoad);

            //Stage enter callback
            if (a_options.onEnter)
                self.on("enter", a_options.onEnter);

            //Stage exit callback
            if (a_options.onExit)
                self.on("exit", a_options.onExit);

            //Handle external source

            var srcPromise = new Promise(function (srcResolve, srcReject) {
                if (Utils.Valid(a_options.src)) {
                    Utils.LoadFileAsync((Utils.Valid(self.parentGM) ? self.parentGM.path : "") + a_options.src).then(value => {
                        self.format(value).then(function () {
                            srcResolve();
                        });
                    }, reason => {
                        Debug.Error("Could not load src: " + a_options.src);
                        Debug.Error(reason);
                        srcReject(reason);
                    })
                } else {
                    srcResolve();
                }
            }).then(value => {

            }).catch(reason => {
                console.log(reason);
            });

            //States
            var sttPromise = new Promise(function (sttResolve, sttReject) {
                if (Utils.Valid(a_options.states)) {
                    var statePromises = new Array();

                    //Loop through provided states
                    for (var i = 0; i < Utils.Length(a_options.states); i++) {
                        var idx = i;
                        statePromises.push(new Promise(function (stiResolve, stiReject) {

                            var stateOptions = a_options.states[idx];
                            stateOptions.parentStage = self;
                            stateOptions.onLoad = function () {
                                stiResolve();
                            }

                            var newStage = new State(stateOptions);
                            //Store stage in gm, not options object
                            self.states[idx] = newStage;
                        }));
                    }

                    Promise.all(statePromises).then(value => {
                        sttResolve();
                    }).catch(reason => {
                        sttReject(reason);
                    });
                } else
                    sttResolve();
            }).then(function () {

            }).catch(reason => {
                Debug.Error("Could not load States for Stage")
                Debug.Error(reason);
            });

            Promise.all([srcPromise, sttPromise]).then(function () {
                resolve();
            }).catch(reason => {
                Debug.Error("Could not resolve all promises to load Stage");
                Debug.Error(reason);
            })
        });
    }

    reset() {
        Debug.Log("Reset Stage - " + this.name, "cyan");
        //TODO: Fix more permanently!
        this.model = Utils.Clone(this.initialModel);

        for (var i = 0; i < this.states.length; i++) {
            this.states[i].reset();
        }

        //this.states.forEach(function(a_state) {
        //    a_state.reset();
        //}, this);

        //Reset current state to 0
        this.setCurrentState(0);

        //Emit event 'on reset'
        this.emit("reset");
    }

    setup() {
        this.emit("setup");
    }

    // -- Called when stage is entered
    enter() {
        Debug.Log("Enter Stage - " + this.name, 'cyan');

        //Emit event 'on enter'
        this.emit("enter"); //Moved so callbacks are fired before views sent

        //TODO: Fix this
        if (this.currentStateIdx > 0)
            this.reset();
        else
            this.setCurrentState(0);
        //this.currentState.enter();

    }

    // -- Called when stage is exited
    exit() {
        Debug.Log("Exit Stage - " + this.name, 'cyan');
        //console.trace("Exiting");
        //Emit event 'on exit'
        this.emit("exit");
    }

    // -- Get current state from index if available
    getState(stateIdx) {
        //If state exists, return
        if (stateIdx >= 0 && stateIdx < this.states.length) {
            var state = this.states[stateIdx];
            //Debug.Log("Found state [" + state.name + "] at index: " + stateIdx, "cyan");
            return state;
        }

        //State does not exist
        Debug.Warning("State does not exist for index: " + stateIdx + ". Returning null!");
        return null;
    }

    // -- Getter to get the current state
    get currentState() {
        return this.getState(this.currentStateIdx);
    }

    setCurrentState(a_idx) {
        //Check if valid state
        if (a_idx >= 0 && a_idx < this.states.length) {
            if (this.currentStateIdx >= 0)
                this.currentState.exit();

            Debug.Log("Resetting Roles If Needed", "green");
            GH.deviceManager.devices.forEach(function (a_device) {
                //Should a_device reset role...
                if (a_device.shouldResetRole)
                    a_device.reset();
            }, this);

            this.currentStateIdx = a_idx;
            this.currentState.enter();
            this.emit("changedState", this.currentStateIdx);

            GH.deviceManager.broadcastState(GH.activeGameMode.currentStage.currentState);
        }
    }

    // -- Overridable function to validate the stage
    isValidated() {
        return true;
    }

    progressStage() {
        Debug.Log("Progressing Stage", "cyan");
        //Early exit if state is not valid to be left
        if (!this.getState(currentState).isValidated())
            return;

        //If valid next state, set current state to next
        if (this.nextStateIdx >= 0)
            this.currentStateIdx = this.nextStateIdx;
    }

    execute() {
        Debug.SetLogPrefix("Stage");

        Debug.Log("Executing stage " + this.name, "cyan");
        Debug.ResetLogPrefix();
    }

    log() {
        Debug.Log("[Stage] Name - " + this.name, "cyan");
        Debug.Log("[Stage] Model Variables - " + Utils.Length(this.model), "cyan");
        Debug.Log("[Stage] Number of States - " + Utils.Length(this.states), "cyan");

        for (var i = 0; i < Utils.Length(this.states); i++) {
            Debug.Log("[Stage] State (" + i + ") - " + this.states[i].name, "cyan");
            //Debug.Log("[Stage] - State: " + this.states[i].name, "cyan");    
            this.states[i].log();
        }
    }
}

// -- Exports Stage Class

module.exports = Stage;