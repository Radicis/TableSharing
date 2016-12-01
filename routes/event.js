var express = require('express');
var router = express.Router();
var User   = require('../models/user');
var Timetable = require('../models/timetable');
var Event = require('../models/event');
var middleware = require('../middleware/helpers');


router.get('/:parentTable', function(req, res){
    Event.getByTableId(req.params.parentTable, function(err, event){
        if(err){
            console.log(err);
            res.json(err);
        }
        res.json(event);
    });
});


router.all("/*", middleware.validToken, function(req, res, next) {
    next(); // if the middleware allowed us to get here,
            // just move on to the next route handler
});


router.post('/', function(req, res){
    var event = req.body;
    Event.add(event, function(err, event){
        if(err){
            console.log(err);
            res.json(err);
        }
        res.json(event);
    })
});

router.put('/', function(req, res){
    var event = req.body;
    Event.update(event, function(err, event){
        if(err){
            console.log(err);
            res.json(err);
        }
        res.json(event);
    })
});

router.put('/move', function(req, res){
    var event = req.body;
    Event.updateTime(event, function(err, event){
        if(err){
            console.log(err);
            res.json(err);
        }
        res.json(event);
    })
});

router.delete('/delete/:id', function(req, res){
    Event.delete(req.params.id, function(err, event){
        if(err){
            console.log(err);
            res.json(err);
        }
        res.json(event);
    })
});

module.exports = router;
