var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Call to API HERE
  res.render('index', { title: 'repGG'});
});
/* get search page */
router.get('/search', function(req, res, next){
	res.render('./pages/search_page', { title: 'repGG'});
});

module.exports = router;
