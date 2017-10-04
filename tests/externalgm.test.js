// tests/api/test-state.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var GameMode = require('..').GameMode;

describe('Create GameMode from external source', function () {
    it('Loaded external GM', function (done) {
        var gamemode = new GameMode({
            src: __dirname + "/../examples/example_gm/example_gm.json",
            path: __dirname + "/../examples/example_gm/",
            onLoad: function () {
                expect(this.stages[0].name).to.equal("Example Stage 1");
                expect(this.stages[1].name).to.equal("Example Stage 2");

                done();
            }
        });
    });
});