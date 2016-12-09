var express = require('express');
var router = express.Router();
var User   = require('../models/user');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config/config');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync(config.secret, salt);

// Authenticates a user based on a username and password
// Returns a signed token to the user as json
router.post('/authenticate', function(req, res){
    // find the user
    User.findOne({
        email: req.body.email
    }, function(err, user) {

        if (err){
            console.log(err);
            res.json(err);
        }
        // If matching name is not found then throw error
        if (!user) {
            res.json({success: false, message: 'Authentication failed. User not found.'});
        } else if (user) {

            // Compared the plain text password in the body to the hashed stored password
            bcrypt.compare(req.body.password, user.password, function(err, response) {

                if(response!=true){
                    res.send({success: false, message: 'Authentication failed. Wrong password.'});
                }
                else {

                    // If is right create a token
                    var token = jwt.sign(user, config.secret, {

                    });

                    // Return JSON including token
                    res.json({
                        success: true,
                        userID: user._id,
                        message: 'Enjoy your token!',
                        token: token
                    });
            }});
        }
    });
});


router.post('/register', function(req, res){
    var user = req.body;
    User.addUser(user, function(err, user){
        if(err){
            console.log(err);
            res.status(err.status || 500);
        }
        res.json(user);
    });
});


module.exports = router;
