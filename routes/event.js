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


router.get('/:parentTable', function(req, res){
    Event.getByTableId(req.params.parentTable, function(err, event){
        if(err){
            console.log(err);
            res.json(err);
        }
        res.json(event);
    });
});
//
// router.get('/personal/:userId', function(req, res){
//     Event.getByUserId(req.params.userId, function(err, event){
//         if(err){
//             console.log(err);
//             res.json(err);
//         }
//         res.json(event);
//     });
// });

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

router.delete('/:_id', function(req, res){
    Event.delete(req.params._id, function(err, event){
        if(err){
            console.log(err);
            res.json(err);
        }
        res.json(event);
    })
});

module.exports = router;
