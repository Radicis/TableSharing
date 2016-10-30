var express = require('express');
var router = express.Router();
var User   = require('../models/user');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

router.get('/setup', function(req, res) {

    // create a sample user
    var nick = new User({
        name: 'User',
        password: 'password',
        admin: true
    });

    // save the sample user
    nick.save(function(err) {
        if (err) throw err;

        console.log('User saved successfully');
        res.json({ success: true });
    });
});

// route to return all users
router.get('/', function(req, res) {

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
                var token = jwt.sign(user, router.get('superSecret'), {
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
