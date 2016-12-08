var mongoose = require('mongoose');

var TimetableSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    startDay: {
        type: Number,
        default: 1
    },
    endDay: {
        type: Number,
        default: 5
    },
    hiddenDays: {
        type: [Number],
        default: [0,6]
    },
    startHour: {
        type: Number,
        default: 9
    },
    endHour: {
        type: Number,
        default: 18
    },
    created: {
        type:Date,
        default: Date.now
    },
    updated:{
        type: Date
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subscribed:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }],
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
        .populate('owner').populate('subscribed')
        .exec(callback);
};

module.exports.add = function(table, callback){
    console.log('Creating new timetable..');
    console.log(table);
    Timetable.create(table, callback);
};

module.exports.update = function(table, callback){
    console.log("Updating table details id: " + table._id);
    console.log(table);
    Timetable.findOneAndUpdate({_id:table._id}, {title:table.title, startDay: table.startDay, endDay: table.endDay, startHour: table.startHour, endHour: table.endHour, updated:table.updated, hiddenDays:table.hiddenDays}, { new: true }, callback);
};

module.exports.delete = function(id, callback){
    console.log("Deleting timetable: " + id);
    Timetable.remove({_id: id}, callback);
};
