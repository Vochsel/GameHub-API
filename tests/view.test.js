/*eslint-env mocha*/

/* External Dependencies */
var chai = require("chai");
var expect = chai.expect;

/* Internal Dependencies */
var View = require("..").View;

describe("View Tests", function () {
	it("Inline View Creation - Options", function (done) {
		return new View({
			name: "Test View",
			type: "testType",
			role: "testRole",
			data: "testData",
			onLoad: function () {
				expect(this.name).to.equal("Test View");
				expect(this.type).to.equal("testType");
				expect(this.role).to.equal("testRole");
				expect(this.data).to.equal("testData");

				done();
			}
		});
	});

	it("Inline View Creation - Defaults", function (done) {
		return new View({
			onLoad: function () {
				expect(this.name).to.equal("Untitled View");
				expect(this.type).to.equal("default");
				expect(this.role).to.equal("default");
				expect(this.data).to.equal("Invalid Data");

				done();
			}
		});
	});

	it("External View Loading", function (done) {
		return new View({
			src: __dirname + "/../examples/example_gm/states/example_state_1/views/example.html",
			onLoad: function () {
				expect(this.data).to.equal("<h1>External View 1</h1>");

				done();
			}
		});
	});
});