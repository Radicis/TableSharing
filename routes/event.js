var express = require('express');
var router = express.Router();
var User   = require('../models/user');
var Timetable = require('../models/timetable');
var Event = require('../models/timetable');
var middleware = require('../middleware/helpers');

// Get listing of all timetables
router.get('/', function(req, res) {
    Event.getAll(function(err, table){
        if(err){
            throw err;
        }
        res.json(table);
    });
});

// Get timetable by unique id
router.get('/:_id', function(req, res){
    Event.getById(req.params._id, function(err, event){
        if(err){
            throw err;
        }
        res.json(event);
    });
});

router.post('/add', function(req, res){
    //create event
});

router.put('/:_id', function(req, res){
   // edit event
});

router.delete('/:_id', function(req, res){
    // delete event
});


module.exports = router;
