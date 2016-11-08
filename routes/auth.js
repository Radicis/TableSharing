var express = require('express');
var router = express.Router();
var User   = require('../models/user');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config/config');

// Temporary method to create a test user
router.get('/setup', function(req, res) {
    // create a sample user
    var newUser = new User({
        name: 'user',
        password: 'password'
    });

    // save the sample user
    User.addUser(newUser, function(err) {
        if (err) throw err;
        console.log('User saved successfully');
        res.json(newUser);
    });
});

// Authenticates a user based on a username and password
// Returns a signed token to the user as json
router.post('/authenticate', function(req, res){
    // find the user
    User.findOne({
        name: req.body.name
    }, function(err, user) {

        if (err) throw err;
        // if matching name is not found then throw error
        if (!user) {
            res.json({success: false, message: 'Authentication failed. User not found.'});
        } else if (user) {

            // if user name is found then check if password matches
            if (user.password != req.body.password) {
                res.json({success: false, message: 'Authentication failed. Wrong password.'});
            } else {

                // if user is found and password is right
                // create a token
                var token = jwt.sign(user, config.secret, {
                    //expiresInMinutes: 1440 // expires in 24 hours
                });

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }
        }
    });
});

module.exports = router;
