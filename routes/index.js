var express = require('express');
var tournamentService = require('../services/tournament');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'TVR' });
});

/* GET tournament list page. */
router.get('/tournaments', function(req, res) {
  res.render('tournament-list', { title: 'Tournaments' });
});

/* GET tournament page. */
router.get('/tournaments/:name', function(req, res) {
	tournamentService.getTournaments(function(tournaments) {
		if (tournaments[req.params.name]) {
			res.render('tournament', { title: req.params.name });
		} else {
			res.status(404);
			res.send();
		}
	});
});

module.exports = router;
