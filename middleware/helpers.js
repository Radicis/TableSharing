var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config/config');

// Checks is a token was passed and if it is valid
module.exports.validToken = function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // if a token is passed then decode token
    if (token) {

        // verifies token by hashing with secret
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    }
    else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
};
