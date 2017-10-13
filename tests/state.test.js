/*eslint-env mocha*/

/* External Dependencies */
var chai = require("chai");
var expect = chai.expect;

/* Internal Dependencies */
var State = require("..").State;

describe("State Tests", function () {
	it("Inline State creation", function (done) {
		return new State({
			name: "Test State",
			onLoad: function () {
				expect(this.name).to.equal("Test State");

				done();
			}
		});
	});

	it("Inline View Creation - Data", function (done) {
		return new State({
			views: [
				{
					data: "Test view data"
				}
			],
			onLoad: function () {
				expect(this.views[0].data).to.equal("Test view data");

				done();
			}
		});
	});

	it("Inline View Creation - Defaults", function (done) {
		return new State({
			views: [
				{
					name: "Test View"
				}
			],
			onLoad: function () {
				expect(this.views[0].name).to.equal("Test View");

				expect(this.views[0].type).to.equal("default");
				expect(this.views[0].role).to.equal("default");

				done();
			}
		});
	});

	it("Inline View Creation - External", function (done) {
		return new State({
			views: [
				{
					name: "Test View",
					src: __dirname + "/../examples/example_gm/states/example_state_1/views/example.html"
				}
			],
			onLoad: function () {
				expect(this.views[0].data).to.equal("<h1>External View 1</h1>");

				done();
			}
		});
	});

	it("External View Loading", function (done) {
		return new State({
			src: __dirname + "/../examples/example_gm/states/example_state_1/meta.json",
			onLoad: function () {
				expect(this.name).to.equal("Example State 1");

				done();
			}
		});
	});
});