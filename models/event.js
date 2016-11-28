var mongoose = require('mongoose');

var EventSchema = mongoose.Schema({
    title: {
        type: String,
        default: 'New Event',
        required: true
    },
    location:{
        type: String,
        default: 'Room 1',
        required: true
    },
    start: {
        type:Date,
        default: Date.now(),
        required: true
    },
    end: {
        type:Date,
        default: Date.now(),
        required: true
    },
    allDay: {
        type: Boolean,
        default:false
    },
    parentTable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: false
    },
    repeat:{
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
});

var Event = module.exports = mongoose.model('Event', EventSchema);

module.exports.getAll = function(callback, limit){
    console.log("Getting all events");
    Event.find().limit(limit)
        .populate('owner') // space delimited path names
        .exec(callback);
};

module.exports.getByTableId = function(id, callback){
    console.log("Getting by table id");
    Event.find({parentTable: id}).exec(callback);
};

module.exports.add = function(event, callback){
    console.log('Creating new event..');
    Event.create(event, callback);
};

module.exports.update = function(event, callback){
    console.log("Updating event id: " + event._id);
    Event.findOneAndUpdate({_id:event._id}, {title:event.title, location:event.location}, { new: true }, callback);
};

module.exports.updateTime = function(event, callback){
    console.log("Updating event id: " + event._id);
    console.log(event);
    Event.findOneAndUpdate({_id:event._id}, {start:event.start, end:event.end}, { new: true }, callback);
};

module.exports.delete = function(event, callback){
    console.log("Deleting event..");
    Event.delete(event, callback);
};
