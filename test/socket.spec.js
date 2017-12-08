process.env.NODE_ENV = 'test';


let chai = require('chai');
let expect = require('chai').expect;
let should = require('chai').should;
let assert = require('chai').assert;
let sinon = require('sinon');

var request = require('request');
// var rp = require('request-promise');

let server = require('../src/server');

chai.use(require('chai-http'));

describe('Integration-test: Server, Socket', () => {

  /*
  * Test the /GET info route
  */
  describe('/GET info', () => {
      it('it should send an info message', (done) => {
        chai.request(server)
        .get('/info')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
      });
  });


});
