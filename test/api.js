var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);


// TODO: Write some useful tests!

describe('Users', function() {

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
