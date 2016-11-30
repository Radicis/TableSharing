var express = require('express');
var router = express.Router();
var User   = require('../models/user');
var Timetable = require('../models/timetable');
var middleware = require('../middleware/helpers');


// Get listing of all timetables
router.get('/', function(req, res) {
    Timetable.getAll(function(err, table){
        if(err){
            console.log(err);
            res.json(err);
        }
        res.json(table);
    });
});

// Get timetable by unique id
router.get('/:_id', function(req, res){
    Timetable.getById(req.params._id, function(err, table){
        if(err){
            console.log(err);
            res.json(err);
        }
        res.json(table);
    });
});

router.all("/*", middleware.validToken, function(req, res, next) {
    next(); // if the middleware allowed us to get here,
            // just move on to the next route handler
});

// Update timetable by unique id
// Ensure valid token and match user ID to owner ID before saving
router.put('/:_id', function(req, res){
    // Timetable.getById(req.params._id, function(err, table){
    //     if(err){
    //         throw err;
    //     }
    //     res.json(table);
    // });
});

router.post('/add', function(req, res){
    var timetable = req.body;
    Timetable.add(timetable, function(err, table){
        if(err){
            console.log(err);
            res.json(err);
        }
        else{
            console.log(table);
            res.json(table);
        }
    })
});


router.delete('/:_id', function(req, res){
    // delete timetable
});

module.exports = router;
