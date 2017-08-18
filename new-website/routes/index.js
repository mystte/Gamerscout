var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Call to API HERE
  res.render('index', { title: 'Repflame'});
});
//search route just for ui testing purposes
router.get('/search', function(req, res, next) {
	res.render('pages/search-page', { title: 'Repflame'});
});
//review route for ui testing purposes
router.get('/player', function(req, res, next) {
	res.render('pages/player_page', { title: 'Repflame'});
});

module.exports = router;
