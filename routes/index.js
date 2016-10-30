var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Please refer to the documentation to use this API.");
});

module.exports = router;
