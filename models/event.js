var mongoose = require('mongoose');

var EventSchema = mongoose.Schema({
    name: {
        type: String,
        default: 'New Event',
        required: true
    },
    location:{
        type: String,
        default: 'Room 1',
        required: true
    },
    startDate: {
        type:Date,
        default: Date.now(),
        required: true
    },
    endDate: {
        type:Date,
        default: Date.now(),
        required: true
    },
    parentTable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
});

var Event = module.exports = mongoose.model('Timetable', EventSchema);

module.exports.getAll = function(callback, limit){
    console.log("Getting all events");
    Event.find().limit(limit)
        .populate('owner') // space delimited path names
        .exec(callback);
    //.limit(limit);
};

module.exports.getById = function(id, callback){
    console.log("Getting by id");
    Event.findOne({_id: id})
        .populate('owner')
        .exec(callback);
};

module.exports.add = function(table, callback){
    console.log('Creating new event..');
    Event.create(table, callback);
};
