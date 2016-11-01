var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var config = require('./config/config');

//Connect to MongoDb
var mongoose = require('mongoose');
mongoose.connect(config.database);
//mongoose.Promise = require('q');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname+'/client'));
app.set('superSecret', "hello"); // secret variable

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));

module.exports = app;
