// tests/api/test-state.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var Controller = require('..').Controller;

describe('Controller Tests', function () {
    it('Inline Controller Creation - Options', function (done) {
        var view = new Controller({
            clientIsReady: function(a_device, a_data) {
                console.log("Client is ready");
                return true;
            },
            onLoad: function () {
                expect(this.clientIsReady).be.a("function");
                done();
            }
        });
    });

    it('External Controller Loading', function (done) {
        var state = new Controller({
            src: __dirname + "/../examples/example_gm/states/example_state_1/controllers/main.js",
            onLoad: function () {
                expect(this.clientIsReady).be.a("function");
                this.clientIsReady();
                done();
            }
        });
    });
});