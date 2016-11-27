var express = require('express');
var router = express.Router();
var User   = require('../models/user');
var Timetable = require('../models/timetable');
var Event = require('../models/event');
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
router.get('/:parentTable', function(req, res){
    Event.getByTableId(req.params.parentTable, function(err, event){
        if(err){
            throw err;
        }
        res.json(event);
    });


    // var date = new Date();
    // var d = date.getDate();
    // var m = date.getMonth();
    // var y = date.getFullYear();
    //
    //  var events = [
    //      {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
    //      {parentTable: "583af6bcdc3107136ce1b574", _id: "583b011ce0d3572e88cb8681", repeat: true, allDay: false, end: "2016-11-27T15:51:51.026Z", start: "2016-11-24T16:00:00.000Z", location: "Room 1", title: "Test Event"},
    //      {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
    //      {title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
    //      {title: 'Birthday Party',start: new Date(y, m, d + 1, 10, 0),end: new Date(y, m, d + 1, 10, 30),allDay: false}
    //  ];
    //
    // res.json(events);

});

router.post('/', function(req, res){
    var event = req.body;
    Event.add(event, function(err, event){
        if(err){
            throw err;
        }
        res.json(event);
    })
});

router.put('/', function(req, res){
    var event = req.body;
    console.log(event);
    console.log("updating event in route");
    Event.update(event, function(err, event){
        if(err){
            throw err;
        }
        res.json(event);
    })
});

router.delete('/:_id', function(req, res){
    // delete event
});


module.exports = router;
