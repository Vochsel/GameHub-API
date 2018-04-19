/*eslint-env mocha*/

/* External Dependencies */
var chai = require("chai");
var expect = chai.expect;

/* Internal Dependencies */
var Utils = require("..").Utils;

describe("Utility Tests", function () {
	it("Format With Data T1", function () {
        var t1 = Utils.FormatStringWithData("test: {x}", {x: "10"});
        console.log("    t1 - " + t1); expect(t1).to.equal("test: 10");
    });

    it("Format With Data T2", function () {
        var t2 = Utils.FormatStringWithData("test: {x.y}", {x: {y: "10"}});
        console.log("    t2 - " + t2); expect(t2).to.equal("test: 10");
    });

    it("Format With Data T3", function () {
        var t3 = Utils.FormatStringWithData("test: {x}[-{val}]", {x: [1, 2]});
        console.log("    t3 - " + t3); expect(t3).to.equal("test: -1-2");
    });

    it("Format With Data T4", function () {
        var t4 = Utils.FormatStringWithData("test: {x}[-{val}]", {x: [{val: 1}, {val: 2}]});
        console.log("    t4 - " + t4); expect(t4).to.equal("test: -1-2");
    });

    it("Format With Data T5", function () {
        var t5 = Utils.FormatStringWithData("test: {x}[{y}[-{val}]]", {x: [ {y: [{val: 1}, {val: 2}]}, {y: [{val: 3}, {val: 2}]}] });
        console.log("    t5 - " + t5); expect(t5).to.equal("test: -1-2-3-2");
    });

    it("Format With Data T4", function () {
        var t4 = Utils.FormatStringWithData("test: {x@--}[{val}]", {x: [{val: 1}, {val: 2}]});
        console.log("    t4 - " + t4); expect(t4).to.equal("test: 1--2");
    });
});