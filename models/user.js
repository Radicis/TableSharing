// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
var UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type:String,
        required: true
    },
    created:{
        type:Date,
        default: Date.now
    },
    pic: {
        type: String,
        default: false
    },
    admin: {
      type: Boolean,
      default: false
    }
});

var User = module.exports = mongoose.model('User', UserSchema);
