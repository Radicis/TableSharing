var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.send("Please refer to the documentation to use this API.");
});

// Login page
router.get('/unauthorised', function(req, res){
  res.status(503);
  res.json({message:'No valid token was supplied'});
});

module.exports = router;
