var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Call to API HERE
  res.render('index', { title: 'Repflame'});
});

module.exports = router;
