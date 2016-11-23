var express = require('express');
var router = express.Router();
var User   = require('../models/user');
var middleware = require('../middleware/helpers');

// // routes starting with `/users` to enforce login before allowing access
// router.all("/*", middleware.validToken, function(req, res, next) {
//   next(); // if the middleware allowed us to get here,
//           // just move on to the next route handler
// });

// Get listing of all users
router.get('/', function(req, res) {
    User.getUsers(function(err, users){
        if(err){
            throw err;
        }
        res.json(users);
    });
});


router.get('/:_id', function(req, res){
    User.getUserById(req.params._id, function(err, user){
        if(err){
            throw err;
        }
        res.json(user);
    });
});

router.put('/:_id', function(req, res){
    // update user info
});

router.post('/subscribe', function(req, res){
    // subscribe user id to table in body
    var userID = req.body.userID;
    var table = req.body.table;

    User.subscribeToTable(userID, table, function(err, response){
        if(err){
            console.log(err);
        }
        else{
            res.json(response);
        }
    });

})

module.exports = router;
