var express = require('express');
var router = express.Router();
var User   = require('../models/user');
var middleware = require('../middleware/helpers');

// Automatically apply the `requireLogin` middleware to all
// routes starting with `/admin`
router.all("/*", middleware.requireLogin, function(req, res, next) {
  next(); // if the middleware allowed us to get here,
          // just move on to the next route handler
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find({}, function(err, users) {
      res.json(users);
  });
});

module.exports = router;
