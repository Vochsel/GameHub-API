/*eslint-env mocha*/

/* External Dependencies */
var chai = require("chai");
var expect = chai.expect;

/* Internal Dependencies */
var GameMode = require("..").GameMode;

describe("Create GameMode from external source", function () {
	it("Loaded external GM", function (done) {
		return new GameMode({
			src: __dirname + "/../examples/example_gm/example_gm.json",
			onLoad: function () {
				expect(this.stages[0].name).to.equal("Example Stage 1");
				expect(this.stages[1].name).to.equal("Example Stage 2");
				expect(this.stages[0].states[0].name).to.equal("Example State 1");

				expect(this.stages[0].states[0].views[0].data).to.equal("<h1>External View 1</h1>");
				expect(this.stages[0].states[0].controllers[0].clientIsReady).be.a("function");

				done();
			}
		});
	});
});