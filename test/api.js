var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);

describe('Users', function() {

    it('should NOT be able to list ALL users on /users GET', function(done) {
        chai.request(server)
            .get('/users')
            .end(function(err, res){
                res.should.have.status(403);
                done();
            });
    });

    it('should be able to login with username and password', function(done) {
        chai.request(server)
            .post('/auth/authenticate')
            .send({'name': 'user', 'password': 'password'})
            .end(function(err, res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.property('token');
                done();
            });
    });

});
