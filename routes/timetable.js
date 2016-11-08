var express = require('express');
var router = express.Router();
var User   = require('../models/user');
var Timetable = require('../models/timetable');
var middleware = require('../middleware/helpers');


// Temporary method to create a test user
router.get('/setup', function(req, res) {
    // create a sample user
    var newTable = new Timetable({
        name: 'Table test 2',
        password: 'password',
        owner: "582064072256591cb4f29ec5"
    });

    // save the sample user
    Timetable.add(newTable, function(err) {
        if (err) throw err;
        console.log('Timetable saved successfully');
        res.json(newTable);
    });
});

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


module.exports = router;
