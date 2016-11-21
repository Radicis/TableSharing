var express = require('express');
var router = express.Router();
var User   = require('../models/user');
var Timetable = require('../models/timetable');
var middleware = require('../middleware/helpers');


// Get listing of all timetables
router.get('/', function(req, res) {
    Timetable.getAll(function(err, table){
        if(err){
            throw err;
        }
        res.json(table);
    });
});

// Get timetable by unique id
router.get('/:_id', function(req, res){
    Timetable.getById(req.params._id, function(err, table){
        if(err){
            throw err;
        }
        res.json(table);
    });
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
    //create timetable
});


router.delete('/:_id', function(req, res){
    // delete timetable
});

module.exports = router;
