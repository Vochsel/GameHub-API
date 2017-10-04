// tests/api/test-state.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var Stage = require('..').Stage;

describe('Stage Tests', function () {
    it('Inline Stage Creation', function (done) {
        var stage = new Stage({
            name: "Test Stage",
            onLoad: function () {
                expect(this.name).to.equal("Test Stage");

                done();
            }
        });
    });

    it('Inline State Creation', function (done) {
        var stage = new Stage({
            states: [
                {
                    name: "Test State"
                }
            ],
            onLoad: function () {
                expect(this.states[0].name).to.equal("Test State");

                done();
            }
        });
    });

    it('External Stage Loading', function (done) {
        var stage = new Stage({
            src: __dirname + "/../examples/example_gm/stages/example_stage_1/meta.json",
            onLoad: function () {
                expect(this.name).to.equal("Example Stage 1");

                done();
            }
        });
    });
});