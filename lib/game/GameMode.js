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
const BaseObject = require('../core/BaseObject');
const Stage = require('./Stage');
const State = require('./State');

/**
 * Class representing a GameMode
 * 
 * @extends BaseObject
 */
class GameMode extends BaseObject {

    /**
     * Creates a new GameMode
     * 
     * @constructor
     * @param {Object} a_options GameMode creation options
     */
    constructor(a_options) {
        super(a_options);

        /* --- GameMode Properties --- */

        //Version of GameMode
        this.version = "Invalid Version";

        //Per GameMode data storage
        this.initialModel = new Object();

        this.model = Utils.Clone(this.initialModel);

        //Array of all stages for this GameMode
        this.stages = new Array();

        //GameMode Resources
        this.resources = new Map();

        //GameMode Flow
        this.flow = [
            {
                stage: "introStage",
                repeats: 1
            },
            {
                stage: "gameStage",
                repeats: 1
            },
            {
                stage: "outroStage",
                repeats: 1
            },
        ];

        //Current stage index
        this.currentStageIdx = -1;

        this.currentFlowIdx = -1;

        this.currentFlowRepeat = 0;

        /* --- Finalize Constructor --- */

        //Starts formatting
        this.startFormat(a_options);
    }

    /**
     * Fills the GameMode object with options provided
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

            //Literal name of GameMode
            if (Utils.Valid(a_options.name))
                self.name = a_options.name;

            //Path of source code if specified
            if (Utils.Valid(a_options.src)) 
                self.setSrc(a_options.src);

            //Version of GameMode
            if (Utils.Valid(a_options.version))
                self.version = a_options.version;

            //Path of GameMode
            if (Utils.Valid(a_options.path))
                self.path = a_options.path;

            //Per GameMode data storage
            if (Utils.Valid(a_options.model))
                self.initialModel = a_options.model;

            if (Utils.Valid(self.initialModel))
                self.model = Utils.Clone(self.initialModel);

            //Flow of gm
            if (Utils.Valid(a_options.flow))
                self.flow = a_options.flow;

            /* --- Stage Callbacks --- */

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
            var srcPromise = new Promise(function (srcResolve, srcReject) {

                if (Utils.Valid(a_options.src)) {
                    Utils.LoadFileAsync(a_options.src).then(value => {
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

            }, reason => {
                Debug.Error(reason);
            });


            //Stages
            var stgPromise = new Promise(function (stgResolve, stgReject) {
                if (Utils.Valid(a_options.stages)) {
                    var stagePromises = new Array();

                    //Loop through provided stages
                    for (var i = 0; i < Utils.Length(a_options.stages); i++) {
                        var idx = i;
                        stagePromises.push(new Promise(function (stiResolve, stiReject) {

                            var stageOptions = a_options.stages[idx];
                            stageOptions.parentGM = self;
                            stageOptions.onLoad = function () {
                                stiResolve();
                            }

                            var newStage = new Stage(stageOptions);
                            //Store stage in gm, not options object
                            self.stages[idx] = newStage;
                        }));
                    }

                    Promise.all(stagePromises).then(value => {
                        stgResolve();
                    }).catch(reason => {
                        stgReject(reason);
                    });
                } else
                    stgResolve();
            }).then(function () {

            }).catch(reason => {
                Debug.Error(reason);
            })

            Promise.all([srcPromise, stgPromise]).then(function () {
                resolve();
            }).catch(reason => {
                Debug.Error(reason);
            })

        });
    }

    // -- Creates and resets all properties to default values
    reset() {
        //Current stage index
        this.currentStageIdx = 0;
        this.currentFlowIdx = 0;
        this.currentFlowRepeat = 0;
    }

    // -- Initial setup of GameMode
    setup() {
        var self = this;

        //TODO: Should this be an event, or own func
        this.on("deviceHandshake", function (a_device) {
            if (!a_device)
                return;
            a_device.sendState(self.currentStage.currentState);

        })
    }

    // -- Starts GameMode
    start() {
        this.setup();
        // -- GM Debug Information
        Debug.SetLogPrefix("GM");
        Debug.Log("Starting GameMode - " + this.name, "green");

        this.currentStageIdx = 0;
        this.currentFlowIdx = 0;
        this.currentFlowRepeat = 0;

        GH.deviceManager.broadcastState(this.currentStage.currentState);

        //Emit event 'on start'
        this.emit("start");

        this.currentStage.enter();
        //this.currentStage.currentState.enter();

        // -- Closing GM Debug Information
        Debug.ResetLogPrefix();
    }

    // -- Stops GameMode
    stop() {
        // -- GM Debug Information
        Debug.SetLogPrefix("GM");
        Debug.Log("Stoping GameMode: " + this.name, "green");

        //Emit event 'on stop'
        this.emit("stop");

        // -- Closing GM Debug Information
        Debug.ResetLogPrefix();
    }

    // -- Get stage from index if available
    getStage(a_idx) {
        if (this.stages.length <= 0)
            return null;

        //If stage exists, return
        if (a_idx >= 0 && a_idx < this.stages.length)
            return this.stages[a_idx];

        //Stage does not exist
        Debug.Warning("Only " + this.stages.length + " stages are loaded. Stage does not exist for index: " + a_idx + " (Off by one). Returning null!");
        return null;
    }

    // -- Get stage by name if available
    getStageIdxByName(a_name) {
        //Loop through all stages
        for (var i = 0; i < this.stages.length; i++) {

            //Store ref to current iteration
            var stage = this.stages[i];

            //If stage name is the same as a_name, return
            if (stage.name === a_name)
                return i;
        }

        //No stage with name supplied has been found
        Debug.Warning("No stage was found with name: " + a_name + "! Returning null!");

        //Return null
        return null;
    }

    setCurrentStage(a_idx) {
        //Check if valid state
        if (a_idx >= 0 && a_idx < this.stages.length) {
            this.currentStage.exit();

            /*GH.deviceManager.devices.forEach(function(a_device) {
                //Should a_device reset role...
                if(a_device.shouldResetRole)
                    a_device.reset();
            }, this);*/

            this.currentStageIdx = a_idx;
            this.currentStage.enter();
            this.emit("changedState", this.currentStageIdx);

            GH.deviceManager.broadcastState(GH.activeGameMode.currentStage.currentState);
            Debug.Log("Set GM current stage");
            return;
        }
        Debug.Error("Could not Set GM current stage - " + a_idx);
    }

    get currentStage() {
        //var s = this.getStage(this.currentStageIdx);
        var s = this.getStage(this.getStageIdxByName(this.flow[this.currentFlowIdx].stage));
        if (s) return s;
    }

    progressGameMode() {

        var nextStateIdx = this.currentStage.currentStateIdx + 1;

        //If next state doesnt exist, go to next stage
        if (nextStateIdx >= this.currentStage.states.length) {
            //Increment how many times this flow stage has repeated...
            this.currentFlowRepeat += 1;

            //Finished stage, go to next stage
            var nextStageIdx = this.currentStageIdx + 1;


            if (this.currentFlowRepeat < this.flow[this.currentFlowIdx].repeats) {
                Debug.Log("---------- Repeating", "yellow");
                //this.setCurrentStage(this.getStageIdxByName(this.flow[this.currentFlowIdx].stage));
                this.setCurrentStage(this.currentStageIdx);
                //this.currentStage.reset();
                //this.currentStage.setCurrentState(0);

                return;
                //this.currentStage.reset();
            }


            if (nextStageIdx >= this.stages.length) {
                //Reached last stage, ending GameMode
                this.stop();
                return;
            }

            this.currentFlowRepeat = 0;
            this.currentFlowIdx += 1;

            this.setCurrentStage(nextStageIdx);

            Debug.Log("Progressed to next Stage - " + nextStageIdx, "cyan");
            return;
        }

        //Next state does exist, set to that
        //this.currentStage.currentStateIdx = nextStateIdx;
        this.currentStage.setCurrentState(nextStateIdx);

        Debug.Log("Progressed to next State - " + nextStateIdx, "magenta");
    }


    isValidated() {
        if (this.currentStage.currentState.isValidated()) {
            console.log("Progressing");
            this.progressGameMode();
        }
    }

    // -- Store resource in map with uid as key
    addResource(a_resource) {
        this.resources.set(a_resource.uid, a_resource);
    }

    /* --- Helper Log Functions --- */

    /**
     * Logs out necessary details of GameMode
     */
    log() {
        Debug.Log("[GM] GameMode - " + this.name + " | Version: " + this.version, "green");
        Debug.Log("[GM] Number of Resources - " + this.resources.size, "green")
        Debug.Log("[GM] Number of Stages - " + this.stages.length, "green")

        for (var i = 0; i < this.stages.length; i++) {
            Debug.Log("[GM] Stage (" + i + ") - " + this.stages[i].name, "green");
            this.stages[i].log();
        }
    }

    /**
     * Logs out current stage and state
     */
    logStatus() {
        return "[Stage] : " + this.currentStage.name + ". [State] : " + this.currentStage.currentState.name + ".";
    }
}

/* Export GameMode */
module.exports = GameMode;