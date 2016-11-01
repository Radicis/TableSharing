var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    name: {
        type: String,
        default: 'foo'
    },
    password: {
        type: String,
        default: 'bar'
    },
    admin: {
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