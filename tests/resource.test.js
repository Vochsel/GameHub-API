// tests/api/test-state.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var Resource = require('..').Resource;

describe('Resource Tests', function () {
    it('Inline Resource Creation - Options', function (done) {
        var resource = new Resource({
            name: "Test Internal Resource",
            data: [
                { "name": "data1" },
                { "name": "data2" },
                { "name": "data3" },
                { "name": "data4" },
                { "name": "data5" },
                { "name": "data6" }
            ],
            onLoad: function () {
                expect(this.name).to.equal("Test Internal Resource");
                expect(this.data[0].name).to.equal("data1");
                expect(this.data[1].name).to.equal("data2");
                expect(this.data[2].name).to.equal("data3");
                expect(this.data[3].name).to.equal("data4");
                expect(this.data[4].name).to.equal("data5");
                expect(this.data[5].name).to.equal("data6");
                
                done();
            }
        });
    });

    it('External Resource Loading', function (done) {
        var resource = new Resource({
            name: "Test Resource",
            src: __dirname + "/../examples/example_gm/resources/example_data.json",
            onLoad: function () {
                expect(this.name).to.equal("Test Resource");
                expect(this.data[0].name).to.equal("data1");
                expect(this.data[1].name).to.equal("data2");
                expect(this.data[2].name).to.equal("data3");
                expect(this.data[3].name).to.equal("data4");
                expect(this.data[4].name).to.equal("data5");
                expect(this.data[5].name).to.equal("data6");
                
                done();
            }
        });
    });

    it('Alternate External Resource Loading', function (done) {
        var resource = new Resource({
            src: __dirname + "/../examples/example_gm/resources/alternate_data.json",
            onLoad: function () {
                expect(this.name).to.equal("altData");
                expect(this.data[0].name).to.equal("data1");
                expect(this.data[1].name).to.equal("data2");
                expect(this.data[2].name).to.equal("data3");
                expect(this.data[3].name).to.equal("data4");
                expect(this.data[4].name).to.equal("data5");
                expect(this.data[5].name).to.equal("data6");
                
                done();
            }
        });
    });
});