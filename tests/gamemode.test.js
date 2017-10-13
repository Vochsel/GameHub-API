/*eslint-env mocha*/

/* External Dependencies */
var chai = require("chai");
var expect = chai.expect;

/*Internal Dependencies */
var GameMode = require("..").GameMode;

describe("GameMode Tests", function () {
	it("Inline GameMode creation", function (done) {
		return new GameMode({
			name: "Test GameMode",
			version: "0.1.0",
			onLoad: function () {
				expect(this.name).to.equal("Test GameMode");
				expect(this.version).to.equal("0.1.0");

				done();
			}
		});
	});

	it("Inline Stage creation within GameMode", function (done) {
		return new GameMode({
			stages: [
				{
					name: "Test Stage"
				}
			],
			onLoad: function () {
				expect(this.stages[0].name).to.equal("Test Stage");

				done();
			}
		});
	});

	it("Multiple inline Stage creation within GameMode", function (done) {
		return new GameMode({
			stages: [
				{
					name: "Test Stage 1"
				},
				{
					name: "Test Stage 2"
				}
			],
			onLoad: function () {
				expect(this.stages[0].name).to.equal("Test Stage 1");
				expect(this.stages[1].name).to.equal("Test Stage 2");

				done();
			}
		});
	});

	it("External GameMode Loading", function (done) {
		return new GameMode({
			src: __dirname + "/../examples/example_gm/example_gm.json",
			onLoad: function () {
				expect(this.name).to.equal("Example Game Mode");

				done();
			}
		});
	});

	it("Inline Resource Loading", function (done) {
		return new GameMode({
			resources: [
				{ "name": "testData", "src": __dirname + "/../examples/example_gm/resources/example_data.json" }
			],
			onLoad: function () {
				expect(this.resources.get("testData").data[0].name).to.equal("data1");
				expect(this.resources.get("testData").data[1].name).to.equal("data2");
				expect(this.resources.get("testData").data[2].name).to.equal("data3");
				expect(this.resources.get("testData").data[3].name).to.equal("data4");
				expect(this.resources.get("testData").data[4].name).to.equal("data5");
				expect(this.resources.get("testData").data[5].name).to.equal("data6");

				done();
			}
		});
	});
});