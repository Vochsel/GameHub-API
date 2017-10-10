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
const GHAPI = require('../..');
const Eval = require('safe-eval');

const BaseObject = require("../core/BaseObject");

/**
 * Class representing a Controller
 * 
 * @extends BaseObject
 */
class Controller extends BaseObject {

    /**
     * Creates a new Controller
     * 
     * @constructor
     * @param {Object} a_options Controller creation options
     */
    constructor(a_options) {
        super();

        /* --- Controller Properties --- */

        /* --- Internal Connections --- */
        
        //State connected to this view
        this.parentState = null;

        /* --- Finalize Constructor --- */

        //Starts formatting
        this.startFormat(a_options);
    }

    /**
     * Fills the Controller object with options provided
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

            //Path of source code if specified
            if (Utils.Valid(a_options.src)) 
                self.src = a_options.src;

            //Merge functions into this object
            //TODO: Bad idea?
            Object.assign(self, a_options);

            /* --- Internal Connections --- */
        
            //State connected to this view
            if (Utils.Valid(a_options.parentState))
                self.parentState = a_options.parentState;

            /* --- View Callbacks --- */

            // On Load Callback
            if (Utils.Valid(a_options.onLoad))
                self.on("load", a_options.onLoad);

            //Handle external source
            var viewSrcPromise = new Promise(function (vsrcResolve, vsrcReject) {
                if (Utils.Valid(a_options.src)) {
                    var rPath = "";
                    if(!Utils.IsAbsolutePath(a_options.src)) {
                        if(Utils.Valid(self.parentState)){
                            if(Utils.Valid(self.parentState.parentStage)){
                                if(Utils.Valid(self.parentState.parentStage.parentGM)){
                                    rPath = self.parentState.parentStage.parentGM.path + self.parentState.path;
                                } else
                                    rPath = self.parentState.parentStage.path + self.parentState.path;
                            } else 
                                rPath = self.parentState.path
                        }
                    }

                    console.log(rPath);

                    Utils.LoadFileAsync(rPath + a_options.src).then(value => {

                        //Compile source
                        var robj = Eval(value, Controller.API()/* , Object.assign(module.exports.CreateContext(), a_opts) */);
                        if(Utils.Valid(robj)) {
                            //Merge parsed code into self
                            //TODO: Very bad
                            Object.assign(self, robj);
                            vsrcResolve();
                        } else {
                            vsrcReject("Could not evaluate source code: " + value);
                        }
                    }, reason => {
                        Debug.Error("Could not load src of controller: " + a_options.src);
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

    static API() {
        return {
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
            Utils: Utils
        }
    }
}

module.exports = Controller;