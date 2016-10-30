var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');

var config = require('./config/config');

//Connect to Mongo
var mongoose = require('mongoose');
mongoose.connect(config.database);
mongoose.Promise = require('q');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname+'/client'));
app.set('superSecret', config.secret); // secret variable

// Include routes
app.use('/', routes);
app.use('/users', users);
app.use('/auth', auth);

module.exports = app;
