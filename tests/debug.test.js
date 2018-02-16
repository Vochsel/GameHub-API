/*eslint-env mocha*/

/* External Dependencies */
var chai = require("chai");
var expect = chai.expect;

/* Internal Dependencies */
var Debug = require("..").Debug;

describe("Debug Log Tests", function () {
	it("Basic Log", function () {
        var success = Debug.Log("This is a test");
        expect(success === true);
    });
    
    it("Basic Color", function () {
        var success = Debug.Log("This is a test", "red");
        expect(success === true);
    });
    
    it("Inclusive debug flag", function () {
        Debug.DebugFlags = ["state"];

        var success = Debug.Log("This is a test", "blue", "state");
        expect(success === true);
	});

    it("Exclusive debug flag", function () {
        Debug.DebugFlags = ["state"];

        var success = Debug.Log("This is a test", "red");
        expect(success === false);
    });
    
    it("Multiple input flags", function () {
        Debug.DebugFlags = ["state", "test"];

        var success = Debug.Log("This is a test", "green");
        expect(success === false);

        success = Debug.Log("This is a test", "green", "state test");
        expect(success === true);

        success = Debug.Log("This is a test", "green", "ed sheeran test");
        expect(success === true);
	});
});