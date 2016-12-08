var express = require('express');
var router = express.Router();
var Event = require('../models/event');
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
            res.status(err.status || 404);
        }
        res.json(table);
    });
});


router.all("/*", middleware.validToken, function(req, res, next) {
    next(); // if the middleware allowed us to get here,
            // just move on to the next route handler
});

router.get('/subscribed/:userID', function(req, res){
    Timetable.getByUserId(req.params.userID, function(err, tables){
        if(err){
            console.log(err);
            res.status(err.status || 404);
        }
        res.json(tables);
    });
});

router.post('/add', function(req, res){
    var timetable = req.body;
    Timetable.add(timetable, function(err, table){
        if(err){
            console.log(err);
            res.status(err.status || 404);
        }
        else{
            console.log(table);
            res.json(table);
        }
    })
});

router.put('/', function(req, res){
    var table = req.body;
    table.updated = Date.now();
    Timetable.update(table, function(err, table){
        if(err){
            console.log(err);
            res.status(err.status || 404);
        }
        res.json(table);
    })
});


router.delete('/delete/:id', function(req, res){
    Timetable.delete(req.params.id, function(err, table){
        if(err){
            console.log(err);
            res.status(err.status || 404);
        }
        console.log("Deleting associated events");
        Event.deleteByTableID(req.params.id, function(err){
            if(err){
                console.log(err);
                res.status(err.status || 404);
            }
            res.json(table);
        });
    })
});

module.exports = router;
