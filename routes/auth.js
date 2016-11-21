var express = require('express');
var router = express.Router();
var User   = require('../models/user');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config/config');

// Authenticates a user based on a username and password
// Returns a signed token to the user as json
router.post('/authenticate', function(req, res){
    // find the user
    User.findOne({
        name: req.body.username
    }, function(err, user) {

        if (err) throw err;
        // If matching name is not found then throw error
        if (!user) {
            res.json({success: false, message: 'Authentication failed. User not found.'});
        } else if (user) {

            // If user name is found then check password
            if (user.password != req.body.password) {
                res.json({success: false, message: 'Authentication failed. Wrong password.'});
            } else {

                // If is right create a token
                var token = jwt.sign(user, config.secret, {
                    //expiresInMinutes: 1440 // expires in 24 hours
                });

                // Return JSON including token
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }
        }
    });
});

router.post('/register', function(req, res){

    // Create user

});

module.exports = router;
