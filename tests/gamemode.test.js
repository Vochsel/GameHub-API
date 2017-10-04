// tests/api/test-state.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var GameMode = require('..').GameMode;

describe('GameMode Tests', function () {
    it('Inline GameMode creation', function (done) {
        var gamemode = new GameMode({
            name: "Test GameMode",
            version: "0.1.0",
            onLoad: function () {
                expect(this.name).to.equal("Test GameMode");
                expect(this.version).to.equal("0.1.0");

                done();
            }
        });
    });

    it('Inline Stage creation within GameMode', function (done) {
        var gamemode = new GameMode({
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

    it('Multiple inline Stage creation within GameMode', function (done) {
        var gamemode = new GameMode({
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
});