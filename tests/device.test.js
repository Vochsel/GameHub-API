/*eslint-env mocha*/

/* External Dependencies */
var chai = require("chai");
var expect = chai.expect;

/* Internal Dependencies */
var Device = require("..").Device;

describe("Device Tests", function () {
	it("Inline Device Creation - Options", function (done) {
		return new Device({
            name: "Test Device",
            type: "testType",
            role: "testRole",
			onLoad: function () {
				expect(this.name).to.equal("Test Device");
				expect(this.type).to.equal("testType");
				expect(this.role).to.equal("testRole");
				done();
			}
		});
	});
});