var mongoose = require('mongoose');
var Timetable = require('../models/timetable');
var bcrypt = require('bcryptjs');

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
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            user.password = hash;
            User.create(user, callback);
        });
    });
};

module.exports.subscribeToTable = function(userID, table, callback){
    console.log('Subscribing user to table..');
    User.findByIdAndUpdate(userID,{$addToSet: {"subscribed": table}}, callback);
};

module.exports.unSubscribeToTable = function(userID, table, callback){
    console.log('UnSubscribing user from table..');
    User.findByIdAndUpdate(userID,{$pull: {"subscribed": table}}, callback);
};