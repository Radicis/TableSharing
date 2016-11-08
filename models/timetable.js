var mongoose = require('mongoose');

var TimetableSchema = mongoose.Schema({
    name: {
        type: String,
        default: 'foo',
        required: true
    },
    password: {
        type: String,
        default: 'bar',
        required: true
    },
    created: {
        type:Date,
        default: Date.now
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    active: {
        type: Boolean,
        default: true
    }
});

var Timetable = module.exports = mongoose.model('Timetable', TimetableSchema);

module.exports.getAll = function(callback, limit){
    console.log("Getting all tables");
    Timetable.find().limit(limit)
        .populate('owner') // space delimited path names
        .exec(callback);
        //.limit(limit);
};

module.exports.getById = function(id, callback){
    console.log("Getting by id");
    Timetable.findOne({_id: id})
        .populate('owner')
        .exec(callback);
};

module.exports.add = function(table, callback){
    console.log('Creating new timetable..');
    Timetable.create(table, callback);
};