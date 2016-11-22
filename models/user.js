var mongoose = require('mongoose');

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
    subscribedTo:{
        type: [String],
        required: false
    },
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
    User.findById(id, callback);
};

module.exports.addUser = function(user, callback){
    console.log('Creating new user..');
    User.create(user, callback);
};