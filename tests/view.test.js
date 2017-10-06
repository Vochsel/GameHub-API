// tests/api/test-state.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var View = require('..').View;

describe('View Tests', function () {
    it('Inline View Creation - Options', function (done) {
        var view = new View({
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

    it('Inline View Creation - Defaults', function (done) {
        var view = new View({
            onLoad: function () {
                expect(this.name).to.equal("Untitled View");
                expect(this.type).to.equal("default");
                expect(this.role).to.equal("default");
                expect(this.data).to.equal("Invalid Data");

                done();
            }
        });
    });

    it('External View Loading', function (done) {
        var state = new View({
            src: __dirname + "/../examples/example_gm/states/example_state_1/views/example.html",
            onLoad: function () {
                expect(this.data).to.equal("<h1>External View 1</h1>");

                done();
            }
        });
    });
});