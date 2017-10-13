/*eslint-env mocha*/

/* External Dependencies */
var chai = require("chai");
var expect = chai.expect;

/* Internal Dependencies */
var Controller = require("..").Controller;

describe("Controller Tests", function () {
	it("Inline Controller Creation - Options", function (done) {
		return new Controller({
			clientIsReady: function ( /*a_device, a_data*/ ) {
				return true;
			},
			onLoad: function () {
				expect(this.clientIsReady).be.a("function");
				done();
			}
		});
	});

	it("External Controller Loading", function (done) {
		return new Controller({
			src: __dirname + "/../examples/example_gm/states/example_state_1/controllers/main.js",
			onLoad: function () {
				expect(this.clientIsReady).be.a("function");
				this.clientIsReady();
				done();
			}
		});
	});
});