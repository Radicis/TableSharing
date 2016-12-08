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
                res.should.have.status(404);
                done();
            });
    });

    it('should be able to login with username and password', function(done) {
        chai.request(server)
            .post('/api/auth/authenticate')
            .send({'email': 'david@gmail.com', 'password': 'dave'})
            .end(function(err, res){
                res.should.have.status(200);
                res.body.should.have.property('token');
                done();
            });
    });

});
