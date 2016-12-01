var mongoose = require('mongoose');
var Timetable = require('../models/timetable');

var UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    created: {
        type:Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    },
    profilePic: {
      type: String,
      default: false
    },
    subscribed:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timetable',
        required: false
    }],
    superUser: {
        type: Boolean,
        default: false
    }
});

var User = module.exports = mongoose.model('User', UserSchema);


module.exports.getUsers = function(callback, limit){
    User.find(callback).limit(limit);
};

module.exports.getUserById = function(id, callback){
    console.log("Getting user by id");
    User.findOne({_id: id})
        .populate('subscribed')
        .exec(callback);
};

module.exports.addUser = function(user, callback){
    console.log('Creating new user..');
    User.create(user, callback);
};

module.exports.subscribeToTable = function(userID, table, callback){
    console.log('Subscribing user to table..');
    // Add userID to subscribed suers for this table
    //Timetable.findByIdAndUpdate(table._id, {$push: {'subscribed': userID}});
    // Add table to users subscried tables
    User.findByIdAndUpdate(userID,{$push: {"subscribed": table}}, callback);
};